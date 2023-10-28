import { type CarCtrl, GameState } from './game'
import { type RoomOptions, RoomType } from './room'

export interface ServerEvents {
    stateSync: (state: GameState) => void
}

export interface ClientEvents {
    carCtrl: (ctrl: CarCtrl) => void
    joinRoom: (type: RoomType, options: RoomOptions) => void
    leaveRoom: () => void
}
