<template>
    <div class="scene absolute bottom-0 left-0 right-0 top-0 overflow-hidden">
        <canvas class="w-1500 h-1500 absolute"></canvas>
        <div class="bullets">
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <PlaygroundBullet
                v-for="bulletState of bullets"
                :state="bulletState"
            />
        </div>
        <div class="cars">
            <PlaygroundCar
                v-for="[id, carState] of cars"
                :key="id"
                :state="carState"
            />
        </div>
        <div class="map"></div>
    </div>
</template>

<script lang="ts" setup>
import type { MapSchema, ArraySchema } from '@colyseus/schema'
import type { Bullet, Car } from '~/models/schema'
import { useUserConfigStore } from '~/stores/userConfig'

defineProps<{
    cars: MapSchema<Car>
    bullets: ArraySchema<Bullet>
}>()

const { theme } = storeToRefs(useUserConfigStore())
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
