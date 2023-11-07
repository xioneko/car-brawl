<template>
    <div
        class="car absolute"
        :class="{
            death: state.status === CarStatus.DEATH,
        }"
        :style="{
            transform: styles.translate.value,
        }"
    >
        <div
            class="car-body absolute -left-[4px] -top-[8px] h-[16px] w-[8px] rounded-sm"
            :class="{
                invincible: state.status === CarStatus.INVINCIBLE,
            }"
            :style="{
                backgroundColor: state.style.body,
                transform: styles.rotate.value,
            }"
        >
            <div
                class="car-roof absolute left-0 top-[6px] h-[6px] w-[8px] rounded-sm"
                :style="{ backgroundColor: state.style.roof }"
            ></div>
        </div>
        <div
            class="car-name absolute -top-[20px] left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6em]"
            :style="{ color: state.style.name }"
        >
            {{ state.name }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { consola } from 'consola'
import { Car, CarStatus, Constant } from '~/models/game'

const logger = useLogger('Car')

const props = defineProps<{
    state: Car
}>()
const emit = defineEmits<{
    onTrack: [direction: number, x: number, y: number, color: string]
}>()

const styles = {
    translate: computed(() => {
        return `translate(${props.state.position.x}px, ${props.state.position.y}px)`
    }),
    rotate: computed(() => {
        return `rotate(${props.state.direction}rad)`
    }),
}
let track: NodeJS.Timeout | undefined
onMounted(() => {
    track = setInterval(() => {
        const { angleVelocity, power } = props.state
        if (
            Math.abs(angleVelocity) > 0.001 ||
            _.inRange(power, Constant.MinPower, Constant.MaxPower)
        ) {
            emit(
                'onTrack',
                props.state.direction,
                props.state.position.x,
                props.state.position.y,
                props.state.style.track,
            )
        }
    }, 1000 / 128)
})

onUnmounted(() => {
    clearInterval(track)
})
</script>

<style lang="less" scoped>
.invincible {
    @apply opacity-50;
}

.death {
    @apply hidden;
}
</style>
