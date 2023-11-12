<template>
    <div class="h-screen w-screen overflow-auto">
        <canvas
            ref="canvasRef"
            class="absolute h-full w-full overflow-hidden bg-gradient-to-br from-[#303036] from-[42%] to-[#6F4222] to-[77.5%]"
        ></canvas>
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

class Particle {
    x: number
    y: number
    color: string
    speedX: number
    speedY: number
    private ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.x = _.random(0, window.innerWidth)
        this.y = _.random(0, window.innerHeight)
        this.color = ['orange', 'hsl(0, 70%, 50%)', 'green'][_.random(0, 2)]
        this.speedX = _.random(-3, 3) || 1
        this.speedY = _.random(-3, 3) || 1
    }

    draw() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, _.random(2, 5), 0, 2 * Math.PI)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
        this.ctx.closePath()
    }

    update() {
        this.x += this.speedX
        this.y += this.speedY

        // 碰撞检测并反弹
        if (this.x < 0 || this.x > window.innerWidth) {
            this.speedX *= -1
        }
        if (this.y < 0 || this.y > window.innerHeight) {
            this.speedY *= -1
        }

        this.draw()
    }
}

const canvasRef = ref<HTMLCanvasElement>()

let onResize: () => void
onMounted(() => {
    const numOfParticles = 80
    const canvas = canvasRef.value!
    const ctx = canvas.getContext('2d')!

    onResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    addEventListener('resize', onResize)
    onResize()

    const particles = _.times(numOfParticles, () => new Particle(ctx))

    function updateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((p) => p.update())
        requestAnimationFrame(updateParticles)
    }

    updateParticles()
})

onUnmounted(() => {
    removeEventListener('resize', onResize)
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
