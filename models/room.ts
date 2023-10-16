import { RevAccount } from './user'

export enum RoomType {
    TimedRoom = 'Timed_Room',
}

export type RoomOptions = {
    account: RevAccount
    accessToken: string
}
