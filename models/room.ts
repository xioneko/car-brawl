import { type RevAccount, type GuestAccount, isRevAccount } from './account'
import type { UserConfig } from './config'

export enum RoomType {
    CompetitiveRoom = 'Competitive_Room',
    FunRoom = 'Fun_Room',
    SingleRoom = 'Single_Room',
}

export interface RoomOptions {
    userConfig: UserConfig
}

export class GuestOptions implements RoomOptions {
    account: GuestAccount
    userConfig: UserConfig
    constructor(account: GuestAccount, config: UserConfig) {
        this.account = account
        this.userConfig = config
    }
}

export class RegularOptions implements RoomOptions {
    account: RevAccount
    userConfig: UserConfig
    accessToken?: string
    constructor(account: RevAccount, config: UserConfig, accessToken?: string) {
        this.account = account
        this.userConfig = config
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

export function createRoomOptions(
    account: RevAccount | GuestAccount,
    userConf: UserConfig,
    accessToken?: string,
) {
    if (isRevAccount(account)) {
        return new RegularOptions(account, userConf, accessToken)
    } else {
        return new GuestOptions(account, userConf)
    }
}
