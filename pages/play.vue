<template>
    <div>
        <div v-if="status === GameStatus.Setup">
            <Setup @on-finish="status = GameStatus.Pending" />
        </div>
        <div v-else-if="status === GameStatus.Pending">
            <Pending @on-finish="status = GameStatus.Playing" />
        </div>
        <div v-else-if="status === GameStatus.Playing">
            <Playground :game-state="gameState" />
        </div>
        <div v-else-if="status === GameStatus.Ended">
            <Ending @on-finish="status = GameStatus.Setup" />
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

const logger = consola.withTag('Game')

enum GameStatus {
    Setup,
    Pending,
    Playing,
    Ended,
}
const status = ref<GameStatus>(GameStatus.Setup)
const socket = useSocket()
const gameState = ref<GameState>()

socket.on('stateSync', (state) => {
    gameState.value = GameState.fromJSON(state)
    logger.debug('Receive state from Server:\n', gameState.value)
})

watch(status, (curr) => {
    let sendCtrl: NodeJS.Timeout | undefined
    if (curr === GameStatus.Playing) {
        sendCtrl = setInterval(() => {
            const ctrl = useCtrlSample()
            if (_.find(ctrl, _.identity)) {
                socket.volatile.emit('carCtrl', ctrl)
            }
        }, 1000 / 120)
    } else {
        clearInterval(sendCtrl)
    }
})

provide(socketKey, socket)
</script>
<style lang="less"></style>
