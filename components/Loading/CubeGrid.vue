<template>
    <div
        :style="{
            width: size,
            height: size,
        }"
        class="spinner spinner--cube-grid"
    >
        <div
            v-for="n in 9"
            :key="n"
            :class="`sk-cube sk-cube${n}`"
            :style="{
                backgroundColor: background,
                animationDuration: duration,
            }"
        ></div>
    </div>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        size: `${number}px`
        background: string
        duration: string
    }>(),
    {
        size: '64px',
        background: '#f69440',
        duration: '1.3s',
    },
)
</script>

<style lang="less" scoped>
.spinner {
    display: inline-block;
    * {
        line-height: 0;
        box-sizing: border-box;
    }
}

.sk-cube {
    width: 33%;
    height: 33%;
    float: left;
    animation: sk-cubeGridScaleDelay 1.8s ease-in-out infinite;
}

.sk-cube1 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
}

.sk-cube2 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
}

.sk-cube3 {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
}

.sk-cube4 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
}

.sk-cube5 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
}

.sk-cube6 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
}

.sk-cube7 {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
}

.sk-cube8 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
}

.sk-cube9 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
}

@keyframes sk-cubeGridScaleDelay {
    0%,
    70%,
    100% {
        transform: scale3D(1, 1, 1);
    }
    35% {
        transform: scale3D(0, 0, 1);
    }
}
</style>
