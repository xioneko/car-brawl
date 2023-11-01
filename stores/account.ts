import { defineStore } from 'pinia'
import {
    type RevAccount,
    type GuestAccount,
    isRevAccount,
    isGuestAccount,
} from '~/models/account'

export type AccountState = { value: RevAccount | GuestAccount }
export enum AccountType {
    Registered,
    Guest,
}

export const useAccountStore = defineStore({
    id: 'accountStore',
    state: (): AccountState => ({
        value: {
            guestId: Math.random().toString(36).slice(-8),
        },
    }),
    getters: {
        type: ({ value: account }) => {
            switch (true) {
                case isRevAccount(account):
                    return AccountType.Registered
                case isGuestAccount(account):
                    return AccountType.Guest
                default:
                    throw new Error('Unknown account type')
            }
        },
        playerId: ({ value: account }) => {
            switch (true) {
                case isRevAccount(account):
                    return account.revAddr
                case isGuestAccount(account):
                    return account.guestId
                default:
                    throw new Error('Unknown account type')
            }
        },
    },
})
