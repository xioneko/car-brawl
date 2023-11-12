<template>
    <div
        class="flex w-3/5 min-w-[500px] max-w-2xl flex-col rounded-md bg-neutral-800/50 p-5 text-neutral-50 backdrop-blur-sm"
    >
        <button
            class="absolute right-3 top-3 transition-transform hover:rotate-90"
            tabindex="-1"
            @click="emit('onClose')"
        >
            <img src="~/assets/icons/close.svg" alt="×" width="15" />
        </button>
        <div class="my-1 flex text-center font-just_for_fun text-4xl">
            <span class="basis-1/4">rank</span>
            <span class="basis-1/2">name</span>
            <span class="basis-1/4">score</span>
        </div>
        <TransitionGroup name="item">
            <div
                v-for="(item, index) of _.sortBy(props.scoreList, [
                    'score',
                ]).reverse()"
                :key="item.player"
                class="mb-1 flex justify-around bg-neutral-400/60 text-center font-syne text-2xl will-change-transform"
                :class="{
                    ' bg-orange-200/30': account.playerId === item.player,
                }"
            >
                <span class="basis-1/4">{{ index + 1 }}</span>
                <span class="basis-1/2">{{ item.name }}</span>
                <span class="basis-1/4">{{ item.score }}</span>
            </div>
        </TransitionGroup>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'

const props = defineProps<{
    scoreList: { player: string; name: string; score: number }[]
}>()

const emit = defineEmits(['onClose'])

const account = useAccount()
</script>

<style scoped>
.item-move,
.item-enter-active,
.item-leave-active {
    transition: all 0.5s ease;
}

.item-enter-from,
.item-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translateX(30px);
}

.item-leave-active {
    position: absolute;
}
</style>
