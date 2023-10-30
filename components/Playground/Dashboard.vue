<template>
    <div>
        <div>Player: {{ source?.player }}</div>
        <div>name: {{ source?.name }}</div>
        <div>Position: {{ source?.position }}</div>
        <div>Velocity: {{ source?.velocity }}</div>
        <div>Direction: {{ source?.direction }}</div>
        <div>Power: {{ source?.power }}</div>
        <div>AngleVel: {{ source?.angleVelocity }}</div>
        <div>Points: {{ source?.points }}</div>
        <div>Status: {{ source?.status }}</div>
    </div>
</template>

<script lang="ts" setup>
import type { Car } from '~/models/game'

const props = defineProps<{
    source?: Car
}>()
</script>

<style></style>
