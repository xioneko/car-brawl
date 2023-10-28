<template>
    <div>
        <div v-if="progress === SetupProgress.ChooseFlavor">
            <SetupFlavor />
        </div>
        <div v-else-if="progress === SetupProgress.Startup">
            <SetupStartup />
        </div>
    </div>
</template>

<script lang="ts" setup>
enum SetupProgress {
    ChooseFlavor,
    Startup,
}
const progress = ref<SetupProgress>(SetupProgress.ChooseFlavor)
</script>

<style lang="less"></style>
