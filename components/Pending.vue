<template>
    <div>Waiting players: {{ progress }}</div>
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

<style></style>
