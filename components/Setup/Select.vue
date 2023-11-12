<template>
    <div class="flex flex-row justify-between">
        <button
            class="disabled:text-white/25"
            :disabled="idx === 0"
            @click="prev"
        >
            &lt;
        </button>
        <div class="w-48">
            <div class="pointer-events-none absolute flex">
                <div
                    v-for="[option] of optionEntries"
                    :key="option"
                    class="w-48 text-center transition-all ease-in"
                    :class="{
                        'opacity-0': option !== optionEntries[idx][0],
                    }"
                    :style="{
                        transform: `translateX(${-idx * 2 * 96}px)`,
                    }"
                >
                    {{ option }}
                </div>
            </div>
        </div>
        <button
            class="disabled:text-white/25"
            :disabled="idx === optionEntries.length - 1"
            @click="next"
        >
            &gt;
        </button>
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

<style scoped>
button:hover:not(:disabled) {
    text-shadow: 0 0 4px #fff;
}
</style>
