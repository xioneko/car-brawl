<template>
    <div class="flex flex-col text-white">
        <div class="pl-8 pt-8 font-narnialone text-5xl">Car Brawl</div>
        <div
            v-if="progress === SetupProgress.ChooseFlavor"
            class="flex h-full flex-col items-center justify-center gap-7 font-just_for_fun text-5xl text-white"
        >
            <div
                v-for="(presets, category) in Flavors"
                :key="category"
                class="flex gap-12"
            >
                <div class="w-32 text-right">{{ _.upperFirst(category) }}</div>
                <SetupSelect
                    v-model="flavor[category].value"
                    class="w-56"
                    :options="presets"
                />
            </div>
        </div>
        <div
            v-else-if="progress === SetupProgress.Startup"
            class="flex h-full flex-col items-center justify-center gap-7 font-just_for_fun text-5xl"
        >
            <div class="flex items-center gap-12">
                <label for="name" class="w-32 text-right">Name</label>
                <input
                    id="name"
                    v-model="name"
                    type="text"
                    maxlength="11"
                    class="w-60 rounded-md border-2 border-white/80 bg-transparent px-5 py-2 text-center text-4xl outline-none selection:bg-white/25"
                />
            </div>
            <div class="flex gap-12">
                <div class="w-32 text-right">Mode</div>
                <SetupSelect
                    v-model="gameMode"
                    class="w-60"
                    :options="
                        account.type === AccountType.Guest
                            ? _.omit(GameModes, ['Competitive'])
                            : GameModes
                    "
                />
            </div>
        </div>
        <div class="flex justify-between px-7 pb-3 font-just_for_fun text-4xl">
            <button
                class="disabled:text-white/25"
                :disabled="progress === SetupProgress.ChooseFlavor"
                @click="prevStep"
            >
                Back
            </button>
            <button class="disabled:text-white/25" @click="nextStep">
                {{
                    progress === SetupProgress.ChooseFlavor
                        ? 'Continue'
                        : "Let's Go!"
                }}
            </button>
        </div>
        <LoadingSpinner :status="joinStatus" />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import type { AsyncDataRequestStatus } from 'nuxt/dist/app/composables/asyncData'
import { BulletStyle, CarStyle, Theme } from '~/models/config'
import {
    RoomType,
    type RevAccount,
    UserConfig,
    type PostBuyTicket,
} from '~/models'

enum SetupProgress {
    ChooseFlavor,
    Startup,
}
const Flavors = {
    theme: Theme.presets,
    car: CarStyle.presets,
    bullet: BulletStyle.presets,
}
const GameModes = {
    Single: RoomType.SingleRoom,
    Fun: RoomType.FunRoom,
    Competitive: RoomType.CompetitiveRoom,
}

const progress = ref<SetupProgress>(SetupProgress.ChooseFlavor)
const name = ref<string>('Anonymous')
const joinStatus = ref<AsyncDataRequestStatus>('idle')
const gameMode = ref(RoomType.SingleRoom)
const flavor = {
    theme: ref(Theme.presets.default),
    car: ref(CarStyle.presets.default),
    bullet: ref(BulletStyle.presets.default),
}
const logger = useLogger('Setup')
const account = useAccount()
const toast = useToast()

const emit = defineEmits<{
    onFinish: [gameMode: RoomType, userConf: UserConfig, accessToken?: string]
}>()

function nextStep() {
    if (progress.value === SetupProgress.ChooseFlavor) {
        progress.value = SetupProgress.Startup
    } else {
        joinGame()
    }
}

function prevStep() {
    progress.value = SetupProgress.ChooseFlavor
}

async function joinGame() {
    const userConf = new UserConfig(
        name.value,
        flavor.theme.value,
        flavor.car.value,
        flavor.bullet.value,
    )

    switch (gameMode.value) {
        case RoomType.SingleRoom:
        case RoomType.FunRoom:
            emit('onFinish', gameMode.value, userConf)
            break
        case RoomType.CompetitiveRoom: {
            try {
                joinStatus.value = 'pending'

                const revAccount = account.value as RevAccount
                const { deploy, signature } = await createDeploy(
                    revAccount,
                    `new deployId(\`rho:rchain:deployId\`), deployer(\`rho:rchain:deployerId\`) in {
                            @"BuyTicket"!(*deployer, "${revAccount.revAddr}", *deployId)
                        }`,
                )
                const { accessToken, error } = await $fetch<PostBuyTicket.Res>(
                    '/api/buyTicket',
                    {
                        method: 'POST',
                        body: {
                            deploy,
                            signature,
                            account: revAccount,
                        } as PostBuyTicket.Req,
                    },
                )

                if (accessToken) {
                    joinStatus.value = 'success'
                    emit('onFinish', gameMode.value, userConf, accessToken)
                    toast.success('Ticket bought successfully!')
                } else {
                    joinStatus.value = 'error'
                    toast.error(`Failed to buy ticket: ${error}`)
                }
                break
            } catch (err) {
                joinStatus.value = 'error'
                logger.error(err)
                toast.error('Failed to buy ticket. Please try again later.')
            }
        }
    }
}
</script>

<style scoped>
button:hover:not(:disabled) {
    text-shadow: 0 0 4px #fff;
}
</style>
