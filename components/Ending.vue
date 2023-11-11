<template>
    <div class="flex h-full flex-col">
        <div class="m-6 text-center font-just_for_fun text-6xl text-white">
            Game Over
        </div>
        <div class="relative flex w-full flex-grow flex-row px-3">
            <div class="h-full basis-[55%]">
                <div
                    class="mb-4 flex justify-between text-center font-just_for_fun text-5xl text-white"
                >
                    <span class="basis-1/6">rank</span>
                    <span class="basis-1/3">player</span>
                    <span class="basis-1/6">score</span>
                    <span class="basis-1/3">reward</span>
                </div>
                <ul>
                    <li
                        v-for="({ player, score, reward }, index) of _.sortBy(
                            results,
                            ['reward'],
                        ).reverse()"
                        :key="player"
                        class="mb-4 flex justify-between text-center font-syne text-2xl text-white"
                    >
                        <span class="basis-1/6">{{ index + 1 }}</span>
                        <span class="basis-1/3">{{
                            player.slice(0, 5) + '...' + player.slice(-5)
                        }}</span>
                        <span class="basis-1/6">{{ score }}</span>
                        <span class="basis-1/3">{{ reward }}</span>
                    </li>
                </ul>
            </div>
            <div
                class="h-4/5 w-[2px] self-center bg-gradient-to-b from-transparent via-orange-300/80 via-40% to-transparent to-70%"
            ></div>
            <div class="h-full basis-[45%] px-3">
                <img
                    :src="avatar"
                    alt="avatar"
                    class="mx-auto mb-6 mt-4 block w-1/4 rounded-lg"
                />
                <div
                    class="mb-1 flex items-center justify-center gap-9 rounded-md text-white"
                >
                    <div
                        class="basis-1/3 text-right font-just_for_fun text-5xl"
                    >
                        score
                    </div>
                    <div class="basis-1/3 text-left font-syne text-3xl">
                        {{ selfResult.score }}
                    </div>
                </div>
                <div
                    class="flex items-center justify-center gap-9 rounded-md text-white"
                >
                    <div
                        class="basis-1/3 text-right font-just_for_fun text-5xl"
                    >
                        reward
                    </div>
                    <div class="basis-1/3 text-left font-syne text-3xl">
                        {{ selfResult.reward }}
                    </div>
                </div>
                <button
                    class="mx-auto mt-16 block border-orange-300 text-center font-just_for_fun text-5xl text-white"
                    @click="emit('onFinish')"
                >
                    Next Game
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'

const props = defineProps<{
    results: { player: string; score: number; reward: number }[]
}>()

const emit = defineEmits(['onFinish'])

const account = useAccount()
const selfResult = computed(() => {
    return (
        _.find(props.results, { player: account.playerId }) ?? {
            player: account.playerId,
            score: 20,
            reward: 83666,
        }
    )
})
const avatar = useAvatar()
</script>

<style scoped>
button:hover {
    text-shadow: 0 0 4px #fff;
}
</style>
