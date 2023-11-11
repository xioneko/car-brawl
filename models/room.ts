import type { UserConfig } from './config'

export enum RoomType {
    CompetitiveRoom = 'Competitive_Room',
    FunRoom = 'Fun_Room',
    SingleRoom = 'Single_Room',
}

export class RoomOptions {
    userConfig: UserConfig
    accessToken?: string
    constructor(config: UserConfig, accessToken?: string) {
        this.userConfig = { ...config }
        this.accessToken = accessToken
    }
}

export interface RoomUserData {
    player: string
    userConfig: UserConfig
}

export interface PendingProgress {
    playersToWait: number
}
