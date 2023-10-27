<template>
    <div
        ref="scene"
        class="scene absolute bottom-0 left-0 right-0 top-0 overflow-hidden"
    >
        <canvas ref="canvas" class="w-1500 h-1500 absolute"></canvas>
        <div class="bullets">
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <!-- <PlaygroundBullet
                v-for="bulletState of bullets?.values() ?? []"
                :state="bulletState"
            /> -->
        </div>
        <div class="cars">
            <!-- <PlaygroundCar
                v-for="[id, carState] of cars ?? []"
                :key="id"
                :state="carState"
                @track="drawTireTrack"
            /> -->
        </div>
        <div class="map"></div>
    </div>
</template>

<script lang="ts" setup>
import { useUserConfigStore } from '~/stores/userConfig'

// const props = defineProps<{}>()

const { theme } = storeToRefs(useUserConfigStore())

const canvas = ref<HTMLCanvasElement | null>()
const scene = ref<HTMLDivElement | null>()

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

<style lang="less" scoped>
.scene {
    user-select: none;
    background-color: v-bind('theme.background');
}

canvas {
    background-color: v-bind('theme.foreground');
}
</style>
