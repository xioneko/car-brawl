<template>
    <div>
        <div v-if="status === GameStatus.Setup">
            <PrettyContainer>
                <Setup class="h-full w-full" @on-finish="startup" />
            </PrettyContainer>
        </div>
        <div v-else-if="status === GameStatus.Pending">
            <PrettyContainer>
                <Pending @on-finish="status = GameStatus.Playing" />
            </PrettyContainer>
        </div>
        <div v-else-if="status === GameStatus.Playing" class="">
            <Playground class="h-screen" :game-state="gameState" />
        </div>
        <div v-else-if="status === GameStatus.Ended">
            <!-- <Ending @on-finish="status = GameStatus.Setup" /> -->
        </div>
        <User class="absolute right-4 top-4" />
        <Popup />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { Socket } from 'socket.io-client'
import { useToast } from 'vue-toastification'
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
    RegularOptions,
    type RevAccount,
} from '~/models'

const logger = useLogger('play')

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
const toast = useToast()

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
    socket.on('joinStatus', (success, error) => {
        if (success) {
            socket.on('stateSync', (state) => {
                gameState.value = isCompetitiveGameState(state)
                    ? CompetitiveGameState.fromJSON(state)
                    : GameState.fromJSON(state)
                // logger.debug('Receive state from Server:\n', gameState.value)
            })
            status.value =
                gameMode === RoomType.CompetitiveRoom
                    ? GameStatus.Pending
                    : GameStatus.Playing
        } else {
            toast.error(error ?? 'Join game failed, please try again later.')
        }
    })
    if (gameMode === RoomType.CompetitiveRoom) {
        socket.emit(
            'joinRoom',
            account.playerId,
            RoomType.CompetitiveRoom,
            new RegularOptions(
                account.value as RevAccount,
                userConf,
                accessToken,
            ),
        )
        type CompetitiveSocket = Socket<CompetitiveServerEvents, ClientEvents>
        ;(socket as CompetitiveSocket).on('endGame', (rewardRes) => {
            logger.debug(rewardRes)
            status.value = GameStatus.Ended
        })
    } else {
        socket.emit(
            'joinRoom',
            account.playerId,
            gameMode,
            createRoomOptions(account.value, userConf),
        )
    }
}
</script>
