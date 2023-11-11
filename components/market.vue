<template>
    <div class="absolute left-0 top-0 h-screen w-screen backdrop-blur">
        <div class="flex h-full flex-col items-center justify-center">
            <div class="mx-auto max-w-screen-md rounded-lg bg-orange-400 p-12">
                <div class="mb-0 flex flex-col items-center justify-center">
                    <div
                        class="mb-2 flex flex-col items-start justify-center text-left"
                    >
                        <label for="id" class="text-l font-bold text-white"
                            >ID:</label
                        >
                        <input
                            id="id"
                            v-model="id"
                            type="text"
                            class="rounded-md border p-1"
                        />
                    </div>
                </div>
                <div class="mb-4 flex flex-col items-center justify-center">
                    <div
                        class="mb-4 flex flex-col items-start justify-center text-left"
                    >
                        <label for="amount" class="text-l font-bold text-white"
                            >Amount:</label
                        >
                        <input
                            id="amount"
                            v-model="amount"
                            type="text"
                            class="rounded-md border p-1"
                        />
                    </div>
                </div>
                <div class="flex justify-center">
                    <button
                        class="mx-2 rounded-md bg-orange-600 px-4 py-2 text-white"
                        @click="transfer"
                    >
                        Transfer
                    </button>
                    <button
                        class="mx-2 rounded-md bg-gray-500 px-4 py-2 text-white"
                        @click="$emit('back')"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue'
const id = ref('')
const amount = ref('')

function transfer() {}
</script>
