import { type CarCtrl, GameState } from './game'
import { type RoomOptions, type PendingProgress, RoomType } from './room'

export type EventsMap<T> = {
    [ev in keyof T]: (...args: any[]) => any
}

export type EventNames<T> = keyof EventsMap<T> & (string | symbol)

export interface ServerEvents {
    stateSync: (state: GameState) => void
}

export interface ClientEvents {
    carCtrl: (ctrl: CarCtrl) => void
    joinRoom: (type: RoomType, options: RoomOptions) => void
    leaveRoom: () => void
}

export interface CompetitiveServerEvents extends ServerEvents {
    progressUpdate: (progress: PendingProgress) => void
    startGame: () => void
    endGame: () => void
}
