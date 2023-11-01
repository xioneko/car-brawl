<template>
    <div>
        <div
            class="absolute left-1/2 top-1/2 inline-flex w-60 -translate-x-1/2 -translate-y-1/2 flex-col gap-5"
        >
            <button class="primary-button">Connect Metamask</button>
            <button class="primary-button">
                <NuxtLink to="/play">Guest Mode</NuxtLink>
            </button>
        </div>
        <Popup />
    </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.primary-button {
    @apply inline-block rounded-lg border border-orange-400 p-2 text-left text-neutral-600 shadow-md hover:bg-orange-200/10;
}
</style>
