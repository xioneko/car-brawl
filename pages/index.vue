<template>
    <div class="bg-white">
        <!-- 添加一个容器用于光点 -->
        <div id="dot-container" class="absolute inset-0">
            <!-- 渲染小光点元素 -->
            <div
                v-for="dot in dots"
                :key="dot.id"
                :style="{
                    left: dot.x + 'px',
                    top: dot.y + 'px',
                    background: dot.color,
                }"
                class="dot"
            ></div>
        </div>
        <div class="relative mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
            <div
                class="relative isolate overflow-hidden bg-gray-900 px-4 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-4 lg:pt-0"
            >
                <!-- 呼吸光球 -->
                <div id="ball-container" class="absolute inset-0">
                    <svg
                        viewBox="0 0 1024 1024"
                        class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
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
                            <radialGradient
                                id="759c1415-0410-454c-8f7c-9a820de03641"
                            >
                                <stop stop-color="orange" />
                                <stop offset="1" stop-color="red" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>

                <div class="relative mt-9 lg:mt-4">
                    <img
                        class="slide-in left-0 top-0 -z-50 w-full rounded-md md:w-[40em] lg:w-[45em] lg:max-w-[1000em]"
                        src="./1234.svg"
                        alt="App screenshot"
                        width="1840"
                        height="1080"
                    />
                </div>

                <div
                    class="mx-auto max-w-md lg:mx-0 lg:flex-auto lg:py-32 lg:text-left"
                >
                    <p class="text-narnialone text-6xl font-bold text-white">
                        Car brawl
                    </p>
                    <p
                        class="text-Aller_Std_It mt-6 text-sm leading-8 text-gray-300"
                    >
                        try this game and you will never regret it ! ! !
                    </p>
                    <div
                        class="mt-10 flex flex-col items-start gap-y-6 lg:justify-start"
                    >
                        <button
                            class="primary-button w-full text-center text-white"
                        >
                            Connect Metamask
                        </button>
                        <button
                            class="primary-button w-full text-center text-white"
                        >
                            <NuxtLink to="/play">Guest Mode</NuxtLink>
                        </button>
                    </div>
                </div>
                <Popup />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 定义光点数组
const dots = ref([])

// 生成随机光点
function generateRandomDot() {
    const colors = ['orange', 'hsl(0, 70%, 50%)', 'green']
    const color = colors[Math.floor(Math.random() * colors.length)] // 随机选择颜色
    const dot = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color, // 随机颜色
        speedX: Math.random() * 3 - 1, // 随机速度
        speedY: Math.random() * 3 - 1,
    }
    dots.value.push(dot)
}

// 移动和碰撞检测
function moveDots() {
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
}

// 在组件挂载后生成初始光点
onMounted(() => {
    const numDots = 100
    const interval = 20 // 每20毫秒生成一个光点

    function generateDotSequentially(index) {
        generateRandomDot()

        if (index < numDots - 1) {
            setTimeout(() => {
                generateDotSequentially(index + 1)
            }, interval)
        }
    }

    generateDotSequentially(0)
})
// 定时移动光点
setInterval(moveDots, 8) // 大约每16毫秒移动一次
</script>

<style scoped>
.dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}
.primary-button {
    @apply inline-block rounded-lg border border-orange-400 p-2 text-center text-white shadow-md hover:bg-orange-200/10;
}

/* 添加circle的CSS动画 */
#ball-container {
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
/* 新的滑入动画 */
.slide-in {
    animation: slideIn 1s ease-out;
    animation-fill-mode: forwards;
    transform: translateX(-100%); /* 初始位置在视图左侧 */
}

@keyframes slideIn {
    to {
        transform: translateX(0); /* 最终位置，回到原始位置 */
    }
}

/*自定义字体部分*/
/* 大标题样式 */
@font-face {
    font-family: 'Narnialone-demo';
    src: url('./fonts/Narnialone-demo.otf') format('opentype');
}

.text-narnialone {
    font-family: 'Narnialone-demo', sans-serif;
}

/* 副标题样式 */
@font-face {
    font-family: 'Aller_Std_It';
    src: url('./fonts/Aller_Std_It.ttf') format('truetype');
}

.text-Aller_Std_It {
    font-family: 'Aller_Std_It', sans-serif;
}
</style>
