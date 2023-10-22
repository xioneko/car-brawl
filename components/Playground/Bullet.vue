<template>
    <div class="bullet absolute -left-1 -top-1 h-2 w-2 rounded-sm"></div>
</template>

<script lang="ts" setup>
import type { Bullet } from '~/models/schema'

defineProps<{
    state: Bullet
}>()

// TODO: 根据状态渲染子弹位置
</script>

<style lang="less" scoped>
.bullet {
    background-color: v-bind('state.bodyColor');
}
</style>
