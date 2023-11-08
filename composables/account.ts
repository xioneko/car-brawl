import ms from 'ms'
import {
    isRevAccount,
    isGuestAccount,
    type RevAccount,
    type GuestAccount,
} from '~/models'

export type AccountState = RevAccount | GuestAccount
export enum AccountType {
    Registered,
    Guest,
}

const logger = useLogger('Account')

export function useAccount() {
    const account = useCookie('account', { maxAge: ms('6 hours') })
    account.value =
        account.value ??
        JSON.stringify({ guestId: Math.random().toString(36).slice(-8) })
    // logger.debug('Account', account.value)
    return {
        get value() {
            // @ts-ignore
            return account.value!
        },
        set value(_account: AccountState) {
            // @ts-ignore
            account.value = _account
        },
        get type() {
            switch (true) {
                case isRevAccount(this.value):
                    return AccountType.Registered
                case isGuestAccount(this.value):
                    return AccountType.Guest
                default:
                    throw new Error('Unknown account type')
            }
        },
        get playerId() {
            switch (true) {
                case isRevAccount(this.value):
                    return this.value.revAddr
                case isGuestAccount(this.value):
                    return this.value.guestId
                default:
                    throw new Error('Unknown account type')
            }
        },
    }
}
