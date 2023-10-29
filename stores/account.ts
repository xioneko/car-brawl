import { defineStore } from 'pinia'
import {
    type RevAccount,
    type GuestAccount,
    isRevAccount,
    isGuestAccount,
} from '~/models/account'

export type AccountState = RevAccount | GuestAccount

export const useAccountStore = defineStore({
    id: 'accountStore',
    state: (): AccountState => ({
        guestId: Math.random().toString(36).slice(-8),
    }),
    actions: {
        getPlayerId(): string {
            switch (true) {
                case isRevAccount(this):
                    return this.revAddr
                case isGuestAccount(this):
                    return this.guestId
                default:
                    throw new Error('Unknown account type')
            }
        },
    },
})
