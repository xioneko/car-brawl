<template>
    <div>
        <div
            class="background fixed h-screen"
            :style="{ backgroundColor: styles.theme.background }"
        ></div>
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
                    v-for="bulletState of gameState?.bullets?.values() ?? []"
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
        <div class="absolute left-5 top-5">
            <div class="relative">
                Velocity:
                {{ `x: ${localCar?.velocity.x}, y: ${localCar?.velocity.y}` }}
            </div>
            <div class="relative">Position: {{ localCar?.position }}</div>
            <div class="relative">Direction: {{ localCar?.direction }}</div>
            <div class="relative">Power: {{ localCar?.power }}</div>
            <div class="relative">Velocity: {{ localCar?.velocity }}</div>
            <div class="relative">AngleVel: {{ localCar?.angleVelocity }}</div>
        </div>
        <!-- <PlaygroundRanking /> -->
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { consola } from 'consola'
import { Car, GameState } from '~/models/game'

const logger = consola.withTag('Playground')
logger.level = process.dev ? 4 : 3

const account = useAccountStore()
const userConf = useUserConfigStore()
const canvas = ref<HTMLCanvasElement | null>()

const props = defineProps<{
    gameState?: GameState
}>()

const localCar = ref<Car>()

const styles = {
    theme: userConf.theme,
    sceneTranslate: computed(() => {
        if (!props.gameState) return

        const player = account.getPlayerId()
        localCar.value = props.gameState.cars.get(player)!

        const sceneX = window.innerWidth / 2 - localCar.value.position.x
        const sceneY = window.innerHeight / 2 - localCar.value.position.y
        return `translate(${sceneX}px, ${sceneY}px)`
    }),
}

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
// TODO: 绘制地图元素（用于提供其他玩家的方位信息）
</script>

<style scoped>
* {
    user-select: none;
}
</style>
