<template>
    <div :style="styles" class="spinner spinner--socker">
        <div :style="innerStyles" class="spinner-inner">
            <div class="cube panelLoad">
                <div class="cube-face cube-face-front">L</div>
                <div class="cube-face cube-face-back">O</div>
                <div class="cube-face cube-face-left">A</div>
                <div class="cube-face cube-face-right">D</div>
                <div class="cube-face cube-face-bottom">I</div>
                <div class="cube-face cube-face-top">N'</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        size?: `${number}px`
    }>(),
    {
        size: '64px',
    },
)
const innerStyles = computed(() => {
    const size = parseInt(props.size) / 2
    return {
        transform: 'scale(' + size / 75 + ')',
    }
})

const styles = computed(() => {
    return {
        width: props.size,
        height: props.size,
    }
})
</script>

<style lang="less" scoped>
.spinner {
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    * {
        box-sizing: border-box;
    }
}
.cube {
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
    transform-style: preserve-3d;
    transition: transform 0.5s 0.1s;
    perspective: 9999px;
    color: #333;
    opacity: 1;
    position: relative;
    &.panelLoad {
        z-index: 11;
        top: 50%;
        animation: letter-cube-panel 2.2s infinite forwards;

        .cube-face {
            font-family: 'Open Sans', sans-serif;
            font-size: 50px;
            color: #f69440;
            box-shadow:
                inset 0 0 0 1px #f69440,
                0 0 1px 1px #f69440;
        }
    }

    .cube-face {
        width: inherit;
        height: inherit;
        position: absolute;
        background: white;
        box-shadow:
            inset 0 0 0 1px #333,
            0 0 1px 1px #333;
        opacity: 1;
    }

    .cube-face-front {
        transform: translate3d(0, 0, 40px);
        font-size: 57px;
    }

    .cube-face-back {
        transform: rotateY(180deg) translate3d(0, 0, 40px);
    }

    .cube-face-left {
        transform: rotateY(-90deg) translate3d(0, 0, 40px);
    }

    .cube-face-right {
        transform: rotateY(90deg) translate3d(0, 0, 40px);
    }

    .cube-face-top {
        transform: rotateX(90deg) translate3d(0, 0, 40px);
    }

    .cube-face-bottom {
        transform: rotateX(-90deg) translate3d(0, 0, 40px);
    }
}

@keyframes letter-cube-panel {
    0% {
        transform: rotateY(0deg) rotateZ(0deg);
    }
    20% {
        transform: rotateY(90deg) rotateZ(0deg);
    }
    40% {
        transform: rotateX(45deg) rotateZ(45deg);
    }
    60% {
        transform: rotateX(90deg) rotateY(180deg) rotateX(90deg);
    }
    80% {
        transform: rotateX(310deg) rotateZ(230deg);
    }
    100% {
        transform: rotateX(360deg) rotateZ(360deg);
    }
}
</style>
