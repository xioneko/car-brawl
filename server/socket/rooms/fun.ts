import { useLogger } from '@nuxt/kit'
import { Room } from '../Room'
import {
    handlePlayerCtrl,
    handlePlayerJoin,
    handlePlayerLeave,
} from '../handlers'
import { RoomType, type RoomOptions } from '~/models/room'
import { CarCtrl, GameState } from '~/models/game'

const logger = useLogger(RoomType.FunRoom)

export class FunRoom extends Room<GameState> {
    constructor() {
        super(RoomType.FunRoom, new GameState())
        logger.info(`Room ${this.roomId} Created`)
    }

    onCarCtrl(clientId: string, ctrl: CarCtrl): void {
        handlePlayerCtrl(ctrl, this.userData.get(clientId)!, this.state)
    }

    onJoin(clientId: string, options: RoomOptions) {
        logger.info(`${clientId} join the room ${this.roomId}}`)
        handlePlayerJoin(clientId, options, this.userData, this.state)
    }

    onBeforeSync() {
        logger.debug('Before Sync')
    }

    onLeave(clientId: string) {
        logger.info(`${clientId} leave the room ${this.roomId}}`)
        handlePlayerLeave(clientId, this.userData, this.state)
    }

    onDispose() {
        logger.info(`Room ${this.roomId} Disposed`)
    }
}
