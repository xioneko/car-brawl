import { defineStore } from 'pinia'
import type { RevAccount, GuestAccount } from '~/models/account'

export type AccountState = RevAccount | GuestAccount

export const useAccountStore = defineStore({
    id: 'accountStore',
    state: (): AccountState => ({
        guestId: Math.random().toString(36).slice(-8),
    }),
    actions: {},
})
