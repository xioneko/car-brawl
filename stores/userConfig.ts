import Color from 'color'
import { defineStore } from 'pinia'
import { UserConfig } from '~/models/config'

export const useUserConfigStore = defineStore({
    id: 'ConfigStore',
    state: (): UserConfig => new UserConfig(),
    actions: {},
})
