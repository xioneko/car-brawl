import { defineStore } from 'pinia'
import type { RevAccount, GuestAccount } from '~/models/account'

export type AccountState = RevAccount | GuestAccount

export const useAccountStore = defineStore({
    id: 'accountStore',
    state: (): AccountState => ({
        guestId: 'test_player_id',
    }),
    actions: {},
})
