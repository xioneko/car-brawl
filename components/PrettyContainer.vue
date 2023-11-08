<template>
    <div class="h-screen w-screen overflow-auto">
        <div class="absolute h-full w-full overflow-hidden">
            <div
                v-for="dot in dots"
                :key="dot.id"
                :style="{
                    left: dot.x + 'px',
                    top: dot.y + 'px',
                    background: dot.color,
                }"
                class="absolute h-2 w-2 rounded-full"
            ></div>
        </div>
        <div
            class="relative top-1/2 mx-auto h-[560px] min-w-[910px] max-w-6xl -translate-y-1/2 overflow-hidden rounded-3xl bg-gray-900 shadow-2xl"
        >
            <slot />
            <svg
                viewBox="0 0 1024 1024"
                class="ball pointer-events-none absolute top-72 aspect-square w-full [mask-image:radial-gradient(closest-side,white,transparent)]"
                aria-hidden="true"
            >
                <circle
                    cx="512"
                    cy="512"
                    r="512"
                    fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                    fill-opacity="1"
                />
                <defs>
                    <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                        <stop stop-color="orange" />
                        <stop offset="1" stop-color="red" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash'

interface Dot {
    id: number
    x: number
    y: number
    color: string
    speedX: number
    speedY: number
}

const dots = ref<Dot[]>([])

let moveDots: NodeJS.Timeout
onMounted(() => {
    const numDots = 80
    const interval = 20 // 每20毫秒生成一个光点
    for (let i = 0; i < numDots; i++) {
        setTimeout(() => {
            const colors = ['orange', 'hsl(0, 70%, 50%)', 'green']
            const dot = {
                id: i,
                x: _.random(0, window.innerWidth),
                y: _.random(0, window.innerHeight),
                color: colors[Math.floor(Math.random() * colors.length)], // 随机选择颜色
                speedX: _.random(-5, 5),
                speedY: _.random(-5, 5),
            }
            dots.value.push(dot)
        }, i * interval)
    }
    moveDots = setInterval(() => {
        dots.value.forEach((dot) => {
            dot.x += dot.speedX
            dot.y += dot.speedY

            // 碰撞检测并反弹
            if (dot.x < 0 || dot.x > window.innerWidth) {
                dot.speedX *= -1
            }
            if (dot.y < 0 || dot.y > window.innerHeight) {
                dot.speedY *= -1
            }
        })
    }, 20)
})

onUnmounted(() => {
    clearInterval(moveDots)
})
</script>

<style scoped>
.ball {
    animation: scatter-circle 2s linear infinite;
}

@keyframes scatter-circle {
    0% {
        transform: scale(0.9);
        opacity: 0.5;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0.9);
        opacity: 0.5;
    }
}
</style>
