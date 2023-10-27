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
        >
            {{ state.name }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Car as CarState } from '~/models/schema'
const props = defineProps<{
    state: CarState
}>()
const emit = defineEmits<{
    track: [x: number, y: number, direction: number]
}>()

const translate = computed(() => {
    return `translate(${props.state.position.x}px, ${props.state.position.y}px))`
})
const rotate = computed(() => {
    return `rotate(${(props.state.direction * 180) / Math.PI}deg)`
})

watch(
    () => props.state.velocity,
    () => {
        emit(
            'track',
            props.state.position.x,
            props.state.position.y,
            props.state.direction,
        )
    },
)
</script>

<style lang="less" scoped>
.car {
    transform: v-bind('translate');
}

.car-body {
    background-color: v-bind('state.bodyColor');
    transform: v-bind('rotate');
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
