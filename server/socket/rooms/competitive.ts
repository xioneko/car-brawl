import crypto from 'node:crypto'
import { useLogger } from '@nuxt/kit'
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
    RegularOptions,
} from '~/models'
import { propose, sendDeploy } from '~/server/rchain/http'

const logger = useLogger(RoomType.CompetitiveRoom)

export class CompetitiveRoom extends Room<
    CompetitiveGameState,
    ClientEvents,
    CompetitiveServerEvents
> {
    static readonly duration: StringValue = process.dev ? '1 min' : '8 min'

    private endTime!: number

    private gameStatus: 'waiting' | 'running' | 'ended' = 'waiting'

    constructor(server: Server) {
        super(
            server,
            RoomType.CompetitiveRoom,
            new CompetitiveGameState(CompetitiveRoom.duration),
            process.dev ? 2 : 4,
        )

        logger.info(`Room ${this.roomId} Created`)
    }

    async createGame() {
        try {
            const deploy = await createSysDeployReq(
                `@"CreateGame"!("${this.roomId}")`,
            )
            await sendDeploy(deploy)
            propose()
            await checkDeployStatus(
                deploy.signature,
                (errored, systemDeployError) => {
                    throw new Error(
                        errored
                            ? 'Deploy Execution Error'
                            : `${systemDeployError}.`,
                    )
                },
            )
            logger.info(`Create game success in room ${this.roomId}`)
        } catch (error) {
            logger.error(error)
            this.createGame() // TODO: Retry？
        }
    }

    onCarCtrl(player: string, ctrl: CarCtrl): void {
        if (this.gameStatus === 'running') {
            handlePlayerCtrl(
                ctrl,
                this.userData.get(player)!,
                this.state,
                this.requestSync.bind(this),
            )
        }
    }

    nextTick(): void {
        if (this.gameStatus === 'running') {
            realtimeUpdate(this.userData, this.state)
            this.state.timeLeft = this.endTime - Date.now()
            if (this.state.timeLeft <= 0) {
                this.send('endGame', this.roomId)
                // TODO: Handle end game
                this.gameStatus = 'ended'
            }
            this.requestSync()
        }
    }

    onAuth(
        options: RegularOptions,
    ): [success: boolean, error?: string | undefined] {
        const { accessToken } = options
        if (accessToken) {
            try {
                logger.debug(
                    'revAddr:',
                    options.account.revAddr,
                    'accessToken:',
                    accessToken,
                )
                const content = decrypt(accessToken)
                logger.debug(`Decrypted access token: ${content}`)
                if (content === options.account.revAddr) {
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
        handlePlayerLeave(clientId, this.userData, this.state)
    }

    onDispose() {
        logger.info(`Room ${this.roomId} Disposed`)
    }
}
