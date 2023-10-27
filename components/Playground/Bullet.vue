<template>
    <div class="bullet absolute -left-1 -top-1 h-2 w-2 rounded-sm"></div>
</template>

<script lang="ts" setup>
import type { Bullet } from '~/models/schema'

const props = defineProps<{
    state: Bullet
}>()

const translate = computed(() => {
    return `translate(${props.state.position.x}px, ${props.state.position.y}px))`
})
const rotate = computed(() => {
    return `rotate(${(props.state.direction * 180) / Math.PI}deg)`
})
</script>

<style lang="less" scoped>
.bullet {
    background-color: v-bind('state.bodyColor');
    transform: v-bind('translate') v-bind('rotate');
}
</style>
