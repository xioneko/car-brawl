import Color from 'color'
import { defineStore } from 'pinia'
import { UserConfig } from '~/models/config'

export const useUserConfigStore = defineStore({
    id: 'ConfigStore',
    state: (): UserConfig =>
        new UserConfig({
            theme: {
                background: Color.hsl(0, 0, 90),
                foreground: Color.hsl(0, 0, 95),
            },
            carStyle: {
                name: Color.hsl(0, 0, 0).alpha(0.5),
                body: Color.hsl(0, 0, 50),
                roof: Color.hsl(0, 0, 100).alpha(0.375),
            },
            bulletStyle: {
                body: Color.hsl(0, 0, 15),
            },
        }),
    actions: {},
})
