import type { RevAccount, GuestAccount } from './account'
import type { UserConfig } from './config'

export enum RoomType {
    CompetitiveRoom = 'Competitive_Room',
    FunRoom = 'Fun_Room',
    SingleRoom = 'Single_Room',
}

export interface RoomOptions {
    playerId: string
    userConfig: UserConfig
}

export class GuestOptions implements RoomOptions {
    playerId: string
    account: GuestAccount
    userConfig: UserConfig
    constructor(account: GuestAccount, config: UserConfig) {
        this.playerId = account.guestId
        this.account = account
        this.userConfig = config
    }
}

export class RegularOptions implements RoomOptions {
    playerId: string
    account: RevAccount
    accessToken: string
    userConfig: UserConfig
    constructor(account: RevAccount, accessToken: string, config: UserConfig) {
        this.playerId = account.revAddr
        this.account = account
        this.accessToken = accessToken
        this.userConfig = config
    }
}

export type RoomUserData = {
    player: string
    userConfig: UserConfig
    carEngine: {
        power: number
        angleVelocity: number
        lastShootAt: number
    }
}
