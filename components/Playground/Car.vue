<template>
    <div
        class="car absolute"
        :style="{ translate: [styles.translate, styles.rotate].join(' ') }"
    >
        <div
            class="car-body absolute -left-[4px] -top-[8px] h-[16px] w-[8px] rounded-sm"
            :class="{ shot: state.status === CarStatus.SHOT }"
            :style="{ backgroundColor: state.style.body }"
        >
            <div
                class="car-roof absolute left-0 top-[6px] h-[6px] w-[8px] rounded-sm"
                :style="{ backgroundColor: state.style.roof }"
            ></div>
        </div>
        <div
            class="car-name absolute left-0 top-[26px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.625em]"
            :style="{ color: state.style.name }"
        >
            {{ state.name }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Car, CarStatus } from '~/models/game'
const props = defineProps<{
    state: Car
}>()
const emit = defineEmits<{
    track: [x: number, y: number, direction: number]
}>()

const styles = {
    translate: computed(() => {
        return `translate(${props.state.position.x}px, ${props.state.position.y}px))`
    }),
    rotate: computed(() => {
        return `rotate(${(props.state.direction * 180) / Math.PI}deg)`
    }),
}
</script>

<style lang="less" scoped>
.shot {
    @apply opacity-50;
}
</style>
