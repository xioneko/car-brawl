<template>
    <div class="absolute" @mouseenter="expandMenu" @mouseleave="foldMenu">
        <img
            src="~/assets/icons/menu.svg"
            alt="menu"
            width="36"
            class="cursor-pointer"
            :class="{ 'brightness-200': isOpen }"
        />
        <Transition name="items">
            <div v-if="isOpen" class="flex flex-col items-center">
                <button
                    v-for="(action, item) of MenuItems"
                    :key="item"
                    class="relative h-12 w-48 border-r-2 border-orange-300 bg-black/40 text-center font-kanit text-2xl text-white hover:border-b-2 hover:bg-orange-400/30"
                    @click="emit(action)"
                >
                    {{ item }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['showRank', 'exit', 'clear', 'showHelp'])
const MenuItems: { [item: string]: Parameters<typeof emit>[0] } = {
    rank: 'showRank',
    clear: 'clear',
    help: 'showHelp',
    exit: 'exit',
}
const isOpen = ref(false)

let fold: NodeJS.Timeout | undefined
function foldMenu() {
    clearTimeout(fold)
    fold = setTimeout(() => {
        isOpen.value = false
    }, 400)
}

function expandMenu() {
    clearTimeout(fold)
    isOpen.value = true
}
</script>

<style scoped>
.items-enter-active {
    animation: move 0.5s;
}
.items-leave-active {
    animation: move 0.3s reverse;
}

@keyframes move {
    from {
        transform: translateY(-20%) scaleY(0.95);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
        pointer-events: none;
    }
}
</style>
