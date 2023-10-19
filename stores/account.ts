import { defineStore } from 'pinia'
import type { RevAccount, GuestAccount } from '#imports'

export type AccountState = RevAccount | GuestAccount

export const useAccountStore = defineStore({
    id: 'accountStore',
    state: (): AccountState => ({
        name: 'guest',
    }),
    actions: {},
})
