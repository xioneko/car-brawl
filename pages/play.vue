<template>
    <div>
        <div v-if="status === GameStatus.Setup">
            <!-- <Setup @on-finish="status = GameStatus.Pending" /> -->
        </div>
        <div v-else-if="status === GameStatus.Pending">
            <!-- <Pending @on-finish="status = GameStatus.Playing" /> -->
        </div>
        <div v-else-if="status === GameStatus.Playing" class="">
            <Playground class="h-screen" :game-state="gameState" />
        </div>
        <div v-else-if="status === GameStatus.Ended">
            <!-- <Ending @on-finish="status = GameStatus.Setup" /> -->
        </div>
        <User />
        <Popup />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { consola } from 'consola'
import { GameState } from '~/models/game'
import { socketKey } from '~/models/injection'
import { RoomType } from '~/models/room'
import { mockRoomOptions } from '~/test/mock'

const logger = consola.withTag('Game')
logger.level = process.dev ? 4 : 3

enum GameStatus {
    Setup,
    Pending,
    Playing,
    Ended,
}
const status = ref<GameStatus>(
    process.dev ? GameStatus.Playing : GameStatus.Setup,
)
const socket = useSocket()
const gameState = ref<GameState>()

let sendCtrl: NodeJS.Timeout | undefined
const ctrl = useCtrlSample()
watch(
    status,
    (curr) => {
        if (curr === GameStatus.Playing) {
            sendCtrl = setInterval(() => {
                // logger.debug('Send ctrl to server:\n', ctrl)
                socket.volatile.emit('carCtrl', ctrl)
            }, 1000 / 128)
        } else {
            clearInterval(sendCtrl)
        }
    },
    { immediate: true },
)

socket.on('stateSync', (state) => {
    gameState.value = GameState.fromJSON(state)
    // logger.debug('Receive state from Server:\n', gameState.value)
})

onMounted(() => {
    if (process.dev) {
        socket.emit(
            'joinRoom',
            RoomType.SingleRoom,
            mockRoomOptions('Test Player', 'guest'),
        )
    }
})

onUnmounted(() => {
    clearInterval(sendCtrl)
    socket.off('stateSync')
    if (process.dev) {
        socket.emit('leaveRoom')
    }
})

provide(socketKey, socket)
</script>
<style lang="less"></style>
