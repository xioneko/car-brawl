<template>
    <div
        class="bullet absolute -left-[1px] -top-[1px] h-[2px] w-[4px] rounded-sm"
        :style="{
            backgroundColor: state.style.body,
            translate: [styles.translate, styles.rotate].join(' '),
        }"
    ></div>
</template>

<script lang="ts" setup>
import { Bullet } from '~/models/game'

const props = defineProps<{
    state: Bullet
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

<style lang="less" scoped></style>
