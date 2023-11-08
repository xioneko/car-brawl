<template>
    <div
        class="font-just_for_fun flex h-full w-full flex-col items-center justify-center text-white"
    >
        <div class="waiting-animation text-left text-6xl after:absolute">
            Waiting players
        </div>
        <div class="mt-8 text-7xl">{{ progress }}</div>
    </div>
</template>

<script lang="ts" setup>
import type { Socket } from 'socket.io-client'
import type { ClientEvents, CompetitiveServerEvents } from '~/models/events'
import { socketKey } from '~/models/injection'

const socket = inject(socketKey)! as Socket<
    CompetitiveServerEvents,
    ClientEvents
>
const progress = ref<number>()

const emit = defineEmits<{
    onFinish: []
}>()

socket.on('progressUpdate', ({ playersToWait }) => {
    progress.value = playersToWait
})

socket.on('startGame', () => {
    emit('onFinish')
})

onUnmounted(() => {
    socket.off('progressUpdate')
    socket.off('startGame')
})
</script>

<style scoped>
::after {
    animation: waiting 1s linear infinite;
}

@keyframes waiting {
    100% {
        content: '';
    }

    25% {
        content: '·';
    }

    50% {
        content: '··';
    }

    75% {
        content: '···';
    }
}
</style>
