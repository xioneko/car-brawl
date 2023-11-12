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
        <div
            v-else-if="status === GameStatus.Playing"
            tabindex="0"
            @keydown.tab.prevent="openScoreboard = true"
            @keyup.tab.prevent="openScoreboard = false"
        >
            <Menu
                class="fixed left-4 top-4 z-10"
                @show-rank="openScoreboard = true"
                @exit="exitGame"
                @show-help="undefined"
                @clear="undefined"
            />
            <ScoreBoard
                v-if="openScoreboard"
                :score-list="scoreList"
                class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                @on-close="openScoreboard = false"
            />
            <Playground
                class="h-screen"
                :game-state="gameState"
                :theme="theme"
            />
        </div>
        <div v-else-if="status === GameStatus.Ended">
            <PrettyContainer>
                <Ending
                    :results="gameResults"
                    @on-finish="status = GameStatus.Setup"
                />
            </PrettyContainer>
        </div>
        <User class="fixed right-4 top-4" z-10 @market="a = !a" />
        <Market v-if="a" @back="a = !a" />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { Socket } from 'socket.io-client'
import {
    GameState,
    type CompetitiveServerEvents,
    type ClientEvents,
    RoomType,
    isCompetitiveGameState,
    CompetitiveGameState,
    UserConfig,
    RoomOptions,
    Theme,
    Constant,
    socketKey,
} from '~/models'

const logger = useLogger('play')
const a = ref(false)

enum GameStatus {
    Setup,
    Pending,
    Playing,
    Ended,
}

const carCtrl = useCtrlSample()
const account = useAccount()
const toast = useToast()
const socket = useSocket()
const status = ref<GameStatus>(GameStatus.Setup)
const gameState = ref<GameState>()
const theme = ref<Theme>(Theme.presets.default)
const openScoreboard = ref(false)
const gameResults = ref<{ player: string; score: number; reward: number }[]>([])
const scoreList = computed(() => {
    return _.map(
        Array.from(gameState.value?.cars.values() ?? []),
        ({ player, name, score }) => ({ player, name, score }),
    )
})

let sendCtrl: NodeJS.Timeout | undefined
watch(
    status,
    (curr) => {
        if (curr === GameStatus.Playing) {
            socket.on('stateSync', (state) => {
                gameState.value = isCompetitiveGameState(state)
                    ? CompetitiveGameState.fromJSON(state)
                    : GameState.fromJSON(state)
                // logger.debug('Receive state from Server:\n', gameState.value)
            })
            sendCtrl = setInterval(() => {
                // logger.debug('Send ctrl to server:\n', ctrl)
                socket.volatile.emit('carCtrl', account.playerId, carCtrl)
            }, 1000 / Constant.TickRate)
        } else {
            clearInterval(sendCtrl)
            socket.off('stateSync')
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
    theme.value = userConf.theme

    socket.emit(
        'joinRoom',
        account.playerId,
        gameMode,
        new RoomOptions(userConf, accessToken),
    )

    socket.on('joinStatus', (success, error) => {
        if (success) {
            status.value =
                gameMode === RoomType.CompetitiveRoom
                    ? GameStatus.Pending
                    : GameStatus.Playing
        } else {
            toast.error(error ?? 'Join game failed, please try again later.')
        }
    })

    if (gameMode === RoomType.CompetitiveRoom) {
        type CompetitiveSocket = Socket<CompetitiveServerEvents, ClientEvents>
        ;(socket as CompetitiveSocket).on('endGame', (rewardRes) => {
            logger.debug(rewardRes)

            gameResults.value = _.map(scoreList.value, (item) => ({
                player: item.player,
                score: item.score,
                reward: rewardRes[item.player] ?? 0,
            }))

            status.value = GameStatus.Ended
        })
    }
}

function exitGame() {
    socket.emit('leaveRoom', account.playerId)
    status.value = GameStatus.Setup
}
</script>
