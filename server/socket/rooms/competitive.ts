import crypto from 'node:crypto'
import _ from 'lodash'
import type { Server } from 'socket.io'
import ms, { StringValue } from 'ms'
import { Room } from '../Room'
import {
    handlePlayerCtrl,
    handlePlayerJoin,
    handlePlayerLeave,
    realtimeUpdate,
} from '../handlers'
import {
    RoomType,
    CompetitiveGameState,
    ClientEvents,
    CompetitiveServerEvents,
    CarCtrl,
    RoomOptions,
} from '~/models'
import { dataAtName, propose, sendDeploy } from '~/server/rchain/http'

const logger = useLogger(RoomType.CompetitiveRoom)

export class CompetitiveRoom extends Room<
    CompetitiveGameState,
    ClientEvents,
    CompetitiveServerEvents
> {
    static readonly duration: StringValue = process.dev ? '1 min' : '8 min'

    private endTime!: number

    private gameStatus: 'waiting' | 'running' | 'ended' | 'finalized' =
        'waiting'

    constructor(server: Server) {
        super(
            server,
            RoomType.CompetitiveRoom,
            new CompetitiveGameState(CompetitiveRoom.duration),
            process.dev ? 2 : 4,
        )
        logger.info(`Room ${this.roomId} Created`)
    }

    onCarCtrl(player: string, ctrl: CarCtrl): void {
        if (this.gameStatus === 'running' || this.gameStatus === 'ended') {
            handlePlayerCtrl(
                ctrl,
                this.userData.get(player)!,
                this.state,
                this.requestSync.bind(this),
            )
        }
    }

    nextTick(): void {
        switch (this.gameStatus) {
            case 'running': {
                realtimeUpdate(this.userData, this.state)
                this.state.timeLeft = Math.max(0, this.endTime - Date.now())
                if (this.state.timeLeft === 0) {
                    // TODO: 处理玩家积分相同的情况
                    const pointsOfPlayer = _.fromPairs(
                        _.map(Array.from(this.userData.keys()), (player) => [
                            player,
                            this.state.cars.get(player)?.score ?? 0,
                        ]),
                    )
                    this.endGame(pointsOfPlayer, (rewardRes) => {
                        const gameRes = _.mapValues(
                            pointsOfPlayer,
                            (score, player) => {
                                return { score, reward: rewardRes[player] }
                            },
                        )
                        this.send('endGame', this.roomId, gameRes)
                        this.gameStatus = 'finalized'
                        this.dispose()
                    })
                    this.gameStatus = 'ended'
                }
                this.requestSync()
                break
            }
            case 'ended': {
                realtimeUpdate(this.userData, this.state)
                this.requestSync()
                break
            }
        }
    }

    onAuth(
        player: string,
        options: RoomOptions,
    ): [success: boolean, error?: string | undefined] {
        const { accessToken } = options
        if (accessToken) {
            try {
                if (CompetitiveRoom.verifyAccessToken(accessToken, player)) {
                    return [true]
                } else {
                    return [false, 'Invalid access token']
                }
            } catch {
                return [false, 'Invalid access token']
            }
        }
        return [false, 'Empty access token']
    }

    onJoin(player: string, options: RoomOptions, rejoin: boolean) {
        if (rejoin) {
            if (this.gameStatus === 'waiting') {
                this.send('progressUpdate', this.roomId, {
                    playersToWait: this.maxPlayers - this.userData.size,
                })
            }
            return
        }

        handlePlayerJoin(player, options, this.userData, this.state)

        const joinedCnt = this.userData.size
        if (joinedCnt === this.maxPlayers) {
            this.send('startGame', this.roomId)
            this.initGame(Array.from(this.userData.keys()))

            this.gameStatus = 'running'
            this.endTime = Date.now() + ms(CompetitiveRoom.duration)

            this.requestSync()
        } else {
            this.send('progressUpdate', this.roomId, {
                playersToWait: this.maxPlayers - joinedCnt,
            })
        }
    }

    onBeforeSync() {
        // logger.debug('Before Sync')
    }

    onLeave(clientId: string) {
        logger.info(`${clientId} leave the room ${this.roomId}}`)
        // TODO: 竞技模式下，退出房间后不会退出游戏
        // handlePlayerLeave(clientId, this.userData, this.state)
    }

    onDispose() {
        logger.info(`Room ${this.roomId} Disposed`)
    }

    private async initGame(players: string[]) {
        try {
            const deploy = await createSysDeployReq(
                `@"CreateGame"!("${this.roomId}") |
                 @["${this.roomId}", "joinGame"]!(${JSON.stringify(
                     players,
                 )}, Nil)`,
            )
            await sendDeploy(deploy)
            await propose()
            logger.info(`Initialize game for room ${this.roomId}`)
        } catch (error) {
            logger.error(`Initialize game failed:`, error)
        }
    }

    private async endGame(
        pointsOfPlayer: Record<string, number>,
        onFinish: (rewardOfPlayer: Record<string, number>) => void,
    ) {
        try {
            const deploy = await createSysDeployReq(
                `new result(\`rho:rchain:deployId\`), deployer(\`rho:rchain:deployerId\`) in {
                    @["${this.roomId}", "endGame"]!(${JSON.stringify(
                        pointsOfPlayer,
                    )}, Nil) |
                    @["${this.roomId}", "reward"]!(*deployer, *result)
                }`,
            )
            await sendDeploy(deploy)
            await propose()

            const deployId = deploy.signature
            await checkDeployStatus(deployId, (errored, systemDeployError) => {
                throw new Error(
                    `Deploy Execution Error: ${
                        systemDeployError ?? 'check the rnode log'
                    }.`,
                )
            })
            const rewardRes = await dataAtName<[string, number][]>(deployId)
            logger.info(`End game for room ${this.roomId}`)
            onFinish(_.fromPairs(rewardRes))
        } catch (error) {
            logger.error('End game failed:', error)
        }
    }

    static createAccessToken(revAddr: string) {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(
            'aes-256-ctr',
            process.env.ACCESS_TOKEN_KEY!,
            iv,
        )
        const encrypted = cipher.update(revAddr, 'utf-8', 'hex')
        return iv.toString('hex') + encrypted + cipher.final('hex')
    }

    static verifyAccessToken(accessToken: string, revAddr: string) {
        const iv = accessToken.slice(0, 32)
        const data = accessToken.slice(32)
        const decipher = crypto.createDecipheriv(
            'aes-256-ctr',
            process.env.ACCESS_TOKEN_KEY!,
            Buffer.from(iv, 'hex'),
        )
        const decrypted = decipher.update(data, 'hex', 'utf-8')
        const content = decrypted + decipher.final('utf-8')
        return content === revAddr
    }
}
