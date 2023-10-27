<template>
    <div>
        <button
            id="play-btn"
            class="absolute top-1/2 -translate-y-1/2 font-body text-3xl text-gray-800 dark:hover:text-gray-200"
            @click="
                emit('joinRoom', RoomType.FunRoom, {
                    name: 'Test_Player',
                    account: useAccountStore(),
                    userConfig: useUserConfigStore(),
                } as GuestOptions)
            "
        >
            Play
        </button>
    </div>
</template>

<script lang="ts" setup>
import { RoomType, type RoomOptions, GuestOptions } from '~/models/room'
const emit = defineEmits<{
    joinRoom: [name: RoomType, options: RoomOptions]
}>()
</script>

<style lang="less"></style>
