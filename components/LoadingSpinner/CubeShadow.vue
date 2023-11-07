<template>
    <div
        :style="{
            width: size,
            height: size,
            backgroundColor: background,
            animationDuration: duration,
        }"
        class="spinner spinner--cube-shadow"
    ></div>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        size?: `${number}px`
        background?: string
        duration?: string
    }>(),
    {
        size: '64px',
        background: '#f69440',
        duration: '1.8s',
    },
)
</script>

<style lang="less" scoped>
.spinner {
    animation: cube-shadow-spinner 1.8s cubic-bezier(0.75, 0, 0.5, 1) infinite;
}
@keyframes cube-shadow-spinner {
    50% {
        border-radius: 50%;
        transform: scale(0.5) rotate(360deg);
    }
    100% {
        transform: scale(1) rotate(720deg);
    }
}
</style>
