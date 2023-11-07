<template>
    <div
        class="bullet absolute -left-[1px] -top-[1px] h-[3px] w-[1.5px] rounded-sm"
        :style="{
            backgroundColor: state.style.body,
            transform: [styles.translate.value, styles.rotate.value].join(' '),
        }"
    ></div>
</template>

<script lang="ts" setup>
import { consola } from 'consola'
import { Bullet } from '~/models/game'

const logger = useLogger('Bullet')

const props = defineProps<{
    state: Bullet
}>()
const styles = {
    translate: computed(() => {
        // logger.debug('Bullet', props.state)
        return `translate(${props.state.position.x}px, ${props.state.position.y}px)`
    }),
    rotate: computed(() => {
        return `rotate(${props.state.direction}rad)`
    }),
}
</script>

<style lang="less" scoped></style>
