<template>
    <div>
        <div v-if="status === GameStatus.Setup">
            <Setup @on-finish="startup" />
        </div>
        <div v-else-if="status === GameStatus.Pending">
            <Pending @on-finish="status = GameStatus.Playing" />
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
import { Socket } from 'socket.io-client'
import { consola } from 'consola'
import {
    GameState,
    type CompetitiveServerEvents,
    type ClientEvents,
    RoomType,
    socketKey,
    isCompetitiveGameState,
    CompetitiveGameState,
    UserConfig,
    createRoomOptions,
} from '~/models'
import { mockRoomOptions } from '~/test/mock'

const logger = consola.withTag('Game')
logger.level = process.dev ? 4 : 3

enum GameStatus {
    Setup,
    Pending,
    Playing,
    Ended,
}
const status = ref<GameStatus>(GameStatus.Setup)
const gameState = ref<GameState>()
const socket = useSocket()
const ctrl = useCtrlSample()
const account = useAccountStore()

logger.debug(`account: `, account.playerId)

let sendCtrl: NodeJS.Timeout | undefined
watch(
    status,
    (curr) => {
        if (curr === GameStatus.Playing) {
            sendCtrl = setInterval(() => {
                // logger.debug('Send ctrl to server:\n', ctrl)
                socket.volatile.emit('carCtrl', account.playerId, ctrl)
            }, 1000 / 128)
        } else {
            clearInterval(sendCtrl)
        }
    },
    { immediate: true },
)

onUnmounted(() => {
    clearInterval(sendCtrl)
    socket.off('stateSync')
})

provide(socketKey, socket)

function startup(
    gameMode: RoomType,
    userConf: UserConfig,
    accessToken?: string,
) {
    socket.on('stateSync', (state) => {
        gameState.value = isCompetitiveGameState(state)
            ? CompetitiveGameState.fromJSON(state)
            : GameState.fromJSON(state)
        // logger.debug('Receive state from Server:\n', gameState.value)
    })
    if (gameMode === RoomType.CompetitiveRoom) {
        type CompetitiveSocket = Socket<CompetitiveServerEvents, ClientEvents>
        socket.emit(
            'joinRoom',
            account.playerId,
            RoomType.CompetitiveRoom,
            // TODO: new RegularOptions(account as RevAccount, userConf, accessToken),
            mockRoomOptions('mock player', 'guest'),
        )
        status.value = GameStatus.Pending
        ;(socket as CompetitiveSocket).on('endGame', () => {
            status.value = GameStatus.Ended
        })
    } else {
        socket.emit(
            'joinRoom',
            account.playerId,
            gameMode,
            createRoomOptions(account, userConf),
        )
        status.value = GameStatus.Playing
    }
}
</script>
<style lang="less"></style>
