<template>
    <div>
        <!-- <NuxtPage /> -->
        <button
            @click="
                socket.emit(
                    'joinRoom',
                    RoomType.SingleRoom,
                    mockRoomOptions('Test_Player', 'guest'),
                )
            "
        >
            Join Room
        </button>
        <button @click="socket.emit('leaveRoom')">Leave Room</button>
        <button @click="emitCtrl({ forward: true })">forward</button>
        <button @click="emitCtrl({ backward: true })">backward</button>
        <button @click="emitCtrl({ left: true })">left</button>
        <button @click="emitCtrl({ right: true })">right</button>
        <button @click="emitCtrl({ shoot: true })">shoot</button>
    </div>
</template>

<script setup lang="ts">
import { io, Socket } from 'socket.io-client'
import { consola } from 'consola'
import { ClientEvents, ServerEvents } from './models/events'
import { RoomType } from './models/room'
import { CarCtrl, GameState } from './models/game'
import { mockRoomOptions } from '~/test/mock'

const logger = consola.withTag('App')
logger.level = process.dev ? 4 : 3

logger.debug('TEST')

const rtConf = useRuntimeConfig()
const socket: Socket<ServerEvents, ClientEvents> = io(
    `:${rtConf.public.wsPort}`,
)

socket.on('stateSync', (state) => {
    logger.debug('Receive state from server:\n', GameState.fromJSON(state))
})

socket.on('connect_error', (err) => {
    logger.error(err.message)
})

socket.on('connect', () => {
    logger.debug('connected')
})

function emitCtrl(ctrl: Partial<CarCtrl>) {
    socket.emit('carCtrl', {
        forward: ctrl.forward ?? false,
        backward: ctrl.backward ?? false,
        left: ctrl.left ?? false,
        right: ctrl.right ?? false,
        shoot: ctrl.shoot ?? false,
    })
}
</script>
