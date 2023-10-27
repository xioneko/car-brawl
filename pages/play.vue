<template>
    <div>
        <div v-if="isPlaying" class="relative">
            <Playground class="absolute bottom-0 left-0 right-0 top-0" />
        </div>
        <div v-else>
            <Startup class="absolute bottom-0 left-0 right-0 top-0" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { io } from 'socket.io-client'

const runtimeConfig = useRuntimeConfig()
const isPlaying = ref(false)
const playerCtrl = useControl()

const socket = io(`:${runtimeConfig.public.wsPort}`)
</script>

<style lang="less"></style>
