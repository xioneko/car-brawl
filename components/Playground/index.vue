<template>
    <div>
        <div
            class="background fixed h-screen [user-select:none]"
            :style="{ backgroundColor: styles.theme.background }"
        ></div>
        <div
            class="scene absolute h-[1500px] w-[1500px] translate-x-[300px] translate-y-[300px] overflow-hidden"
            :style="{ backgroundColor: styles.theme.foreground }"
        >
            <canvas ref="canvas" class="absolute h-full"></canvas>
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
                    @track="drawTireTrack"
                />
            </div>
        </div>
        <PlaygroundRanking />
    </div>
</template>

<script lang="ts" setup>
import { GameState } from '~/models/game'
import { useUserConfigStore } from '~/stores/userConfig'

const userConf = useUserConfigStore()
const canvas = ref<HTMLCanvasElement | null>()

const props = defineProps<{
    gameState?: GameState
}>()

const styles = {
    theme: userConf.theme,
}

function drawTireTrack(x: number, y: number, direction: number) {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!
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
