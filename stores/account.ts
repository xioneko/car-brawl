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
    getters: {
        playerId: (state) => {
            switch (true) {
                case isRevAccount(state):
                    return state.revAddr
                case isGuestAccount(state):
                    return state.guestId
                default:
                    throw new Error('Unknown account type')
            }
        },
    },
})
