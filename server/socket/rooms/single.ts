import { Server } from 'socket.io'
import { Room } from '../Room'
import {
    handlePlayerCtrl,
    handlePlayerJoin,
    handlePlayerLeave,
    realtimeUpdate,
} from '../handlers'
import { RoomType, type RoomOptions, CarCtrl, GameState } from '~/models'

const logger = useLogger(RoomType.SingleRoom)

export class SingleRoom extends Room<GameState> {
    constructor(server: Server) {
        super(server, RoomType.SingleRoom, new GameState(), 1)
        logger.info(`Room ${this.roomId} Created`)
    }

    onCarCtrl(player: string, ctrl: CarCtrl): void {
        // logger.debug(`Receive ctrl state from ${clientId}:\n`, ctrl)
        handlePlayerCtrl(
            ctrl,
            this.userData.get(player)!,
            this.state,
            this.requestSync.bind(this),
        )
    }

    nextTick(): void {
        realtimeUpdate(this.userData, this.state, this.requestSync.bind(this))
    }

    onJoin(player: string, options: RoomOptions, rejoin: boolean) {
        if (rejoin) return

        handlePlayerJoin(player, options, this.userData, this.state)
        this.requestSync()
    }

    onBeforeSync() {
        // logger.debug('Before Sync')
    }

    onLeave(player: string) {
        handlePlayerLeave(player, this.userData, this.state)
    }

    onDispose() {
        logger.info(`Room ${this.roomId} Disposed`)
    }
}
