import { RevAccount } from './account'

export enum RoomType {
    CompetitiveRoom = 'Competitive Room',
    FunRoom = 'Fun Room',
    SingleRoom = 'Single Room',
}

export type RoomOptions = {
    account: RevAccount
    accessToken: string
}
