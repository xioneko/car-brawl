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
    carCtrl: (player: string, ctrl: CarCtrl) => void
    joinRoom: (player: string, type: RoomType, options: RoomOptions) => void
    leaveRoom: (player: string) => void
    [ev: string]: (player: string, ...args: any[]) => any
}

export interface CompetitiveServerEvents extends ServerEvents {
    progressUpdate: (progress: PendingProgress) => void
    startGame: () => void
    endGame: () => void
}
