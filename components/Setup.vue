<template>
    <div>
        <div v-if="progress === SetupProgress.ChooseFlavor">
            <!-- TODO -->
        </div>
        <div
            v-else-if="progress === SetupProgress.Startup"
            class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-9"
        >
            <select
                id="guest-id"
                v-model="guestId"
                name="guestId"
                :disabled="account.type === AccountType.Registered"
            >
                <option disabled selected value="">Mock a guest ID</option>
                <option v-for="n in 5" :key="n">
                    {{ `text_${_.repeat(n.toString(), 5)}` }}
                </option>
            </select>
            <div>
                <label for="name" class="pr-2">Name</label>
                <input
                    id="name"
                    v-model="name"
                    type="text"
                    placeholder="Anonymous"
                />
            </div>
            <div class="mode flex flex-row gap-4">
                <div
                    v-for="(label, roomType) in {
                        [RoomType.SingleRoom]: 'Single',
                        [RoomType.FunRoom]: 'Fun',
                        [RoomType.CompetitiveRoom]: 'Competitive',
                    }"
                    :key="roomType"
                >
                    <input
                        :id="roomType"
                        v-model="gameMode"
                        type="radio"
                        class="peer hidden"
                        :checked="roomType === RoomType.SingleRoom"
                        :disabled="
                            roomType === RoomType.CompetitiveRoom &&
                            account.type === AccountType.Guest
                        "
                        :value="roomType"
                    />
                    <label
                        :for="roomType"
                        class="cursor-pointer peer-checked:text-orange-400 peer-disabled:text-gray-400"
                        >{{ label }}</label
                    >
                </div>
            </div>
            <button class="inline-block" @click="joinGame">Let's Go</button>
        </div>
        <LoadingSpinner :status="joinStatus" />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { useToast } from 'vue-toastification'
import type { AsyncDataRequestStatus } from 'nuxt/dist/app/composables/asyncData'
import {
    RoomType,
    type RevAccount,
    type UserConfig,
    type PostBuyTicket,
} from '~/models'

enum SetupProgress {
    ChooseFlavor,
    Startup,
}
const progress = ref<SetupProgress>(SetupProgress.Startup)
const guestId = ref<string>('')
const name = ref<string>()
const gameMode = ref<RoomType>(RoomType.SingleRoom)
const joinStatus = ref<AsyncDataRequestStatus>('idle')
const logger = useLogger('Setup')
const userConf = useUserConfigStore()
const account = useAccountStore()
const toast = useToast()

const emit = defineEmits<{
    onFinish: [gameMode: RoomType, userConfig: UserConfig, accessToken?: string]
}>()

async function joinGame() {
    if (account.type === AccountType.Guest && guestId.value)
        account.$patch({ value: { guestId: guestId.value } })
    if (name.value) userConf.$patch({ name: name.value })

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
