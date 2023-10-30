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
} from '~/models'

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

    onCarCtrl(clientId: string, ctrl: CarCtrl): void {
        if (this.gameStatus === 'running') {
            handlePlayerCtrl(
                ctrl,
                this.userData.get(clientId)!,
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
        options: RoomOptions,
    ): [success: boolean, error?: string | undefined] {
        // TODO: 验证 “入场券”，由 Deploy 返回
        return [true]
    }

    onJoin(clientId: string, options: RoomOptions) {
        logger.info(`${clientId} join the room ${this.roomId}}`)
        handlePlayerJoin(clientId, options, this.userData, this.state)

        const joinedCnt = this.userData.size
        if (joinedCnt === this.maxPlayers) {
            this.send('startGame', this.roomId)
            this.gameStatus = 'running'
            this.endTime = Date.now() + ms('8 minutes')
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
