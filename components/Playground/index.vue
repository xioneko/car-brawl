<template>
    <div>
        <div
            class="fixed h-screen w-screen"
            :style="{ backgroundColor: styles.theme.background }"
        >
            <div
                class="scene absolute h-[1500px] w-[1500px] overflow-hidden"
                :style="{
                    transform: styles.sceneTranslate.value,
                }"
            >
                <canvas
                    ref="canvas"
                    class="absolute left-0 top-0 h-full w-full"
                    width="1500"
                    height="1500"
                    :style="{ backgroundColor: styles.theme.foreground }"
                ></canvas>
                <div class="bullets">
                    <!-- eslint-disable-next-line vue/valid-v-for -->
                    <PlaygroundBullet
                        v-for="bulletState of gameState?.bullets?.values() ??
                        []"
                        :state="bulletState"
                    />
                </div>
                <div class="cars">
                    <PlaygroundCar
                        v-for="[id, carState] of gameState?.cars ?? []"
                        :key="id"
                        :state="carState"
                        @on-track="drawTireTrack"
                    />
                </div>
            </div>
            <div
                v-if="isCompetitiveGameState(gameState)"
                class="contrast-color fixed left-1/2 top-4 z-10 -translate-x-1/2 font-ibm_plex_mono text-3xl"
                :style="{ color: countdownColor }"
            >
                {{ dayjs(gameState.timeLeft).format('mm:ss') }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import dayjs from 'dayjs'
import Color from 'color'
import { Car, isCompetitiveGameState, GameState } from '~/models/game'
import { Theme } from '~/models'

defineExpose({
    clear: clearPlayground,
})

const props = defineProps<{
    gameState?: GameState
    theme?: Theme
}>()

const logger = useLogger('Playground')
const account = useAccount()
const canvas = ref<HTMLCanvasElement | null>()
const localCar = ref<Car>()

const styles = {
    theme: props.theme ?? Theme.presets.default,
    sceneTranslate: computed(() => {
        if (!props.gameState) return

        const player = account.playerId
        localCar.value = props.gameState.cars.get(player)!

        const sceneX = window.innerWidth / 2 - localCar.value.position.x
        const sceneY = window.innerHeight / 2 - localCar.value.position.y
        return `translate(${sceneX}px, ${sceneY}px)`
    }),
}
const countdownColor = computed(() => {
    return Color(styles.theme.background).isDark()
        ? Color(styles.theme.background).lighten(0.5).hex()
        : Color(styles.theme.background).darken(0.5).hex()
})

function drawTireTrack(direction: number, x: number, y: number, color: string) {
    if (!props.gameState || !canvas.value) return
    const ctx = canvas.value.getContext('2d')!
    ctx.fillStyle = color
    ctx.fillRect(
        x -
            Math.cos(direction + (3 * Math.PI) / 2) * 3 +
            Math.cos(direction + (2 * Math.PI) / 2) * 3,
        y -
            Math.sin(direction + (3 * Math.PI) / 2) * 3 +
            Math.sin(direction + (2 * Math.PI) / 2) * 3,
        1,
        1,
    )
    ctx.fillRect(
        x -
            Math.cos(direction + (3 * Math.PI) / 2) * 3 +
            Math.cos(direction + (4 * Math.PI) / 2) * 3,
        y -
            Math.sin(direction + (3 * Math.PI) / 2) * 3 +
            Math.sin(direction + (4 * Math.PI) / 2) * 3,
        1,
        1,
    )
}

function clearPlayground() {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')!
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
}
</script>
