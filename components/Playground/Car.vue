<template>
    <div class="car absolute">
        <div
            class="car-body absolute -left-4 -top-8 h-16 w-8 rounded-sm"
            :class="{ shot: state.status === 'shot' }"
        >
            <div
                class="car-roof absolute left-0 top-6 h-6 w-8 rounded-sm"
            ></div>
        </div>
        <div
            class="car-name absolute left-0 top-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs dark:text-slate-800/80"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import type { Car as CarState } from '~/models/schema'
const props = defineProps<{
    state: CarState
}>()

// TODO: 根据状态渲染小车位置
</script>

<style lang="less" scoped>
.car-body {
    background-color: v-bind('state.bodyColor');
}

.car-body.shot {
    @apply opacity-50;
}

.car-roof {
    background-color: v-bind('state.roofColor');
}

.car-name {
    color: v-bind('state.nameColor');
}
</style>
