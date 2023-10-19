import { defineStore } from 'pinia'
import { RoomState } from '~/models/schema'

export const useGameStore = defineStore({
    id: 'gameStore',
    state: (): RoomState => new RoomState(),
    actions: {},
})
