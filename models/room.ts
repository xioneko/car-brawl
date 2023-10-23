import type { RevAccount, GuestAccount } from './account'

export enum RoomType {
    CompetitiveRoom = 'Competitive Room',
    FunRoom = 'Fun Room',
    SingleRoom = 'Single Room',
}

export interface RoomOptions {
    name: string
}

export interface GuestOptions extends RoomOptions {
    account: GuestAccount
    userConfig: UserConfig
}

export interface RegularOptions extends RoomOptions {
    account: RevAccount
    accessToken: string
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

export function isGuestOptions(options: RoomOptions): options is GuestOptions {
    return 'userConfig' in options
}

export function isRegularOptions(
    options: RoomOptions,
): options is RegularOptions {
    return 'accessToken' in options
}
