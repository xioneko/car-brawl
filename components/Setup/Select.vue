<template>
    <div class="flex flex-row justify-between">
        <button @click="prev">&lt;</button>
        <div>{{ optionEntries[idx][0] }}</div>
        <button @click="next">&gt;</button>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash'

const props = defineProps<{
    modelValue: any
    options: Record<string, any>
}>()

const emit = defineEmits(['update:modelValue'])

const optionEntries = computed(() => _.entries(props.options))
const idx = computed(() =>
    _.findIndex(optionEntries.value, [1, toValue(props.modelValue)]),
)

function next() {
    const size = optionEntries.value.length
    if (size === 0) return

    const update = optionEntries.value[(idx.value + 1) % size][1]
    emit('update:modelValue', update)
}

function prev() {
    const size = optionEntries.value.length
    if (size === 0) return

    const update = optionEntries.value[(idx.value - 1 + size) % size][1]
    emit('update:modelValue', update)
}
</script>
