<template>
    <div class="absolute left-0 top-0 h-screen w-screen">
        <div class="flex h-full flex-col items-center justify-center">
            <div
                class="mx-auto rounded-lg bg-gradient-to-br from-[#190A05] from-35% to-[#873800] px-12 pb-9 pt-16"
            >
                <div
                    class="mb-0 flex flex-col items-center justify-center gap-10"
                >
                    <div class="relative">
                        <input
                            v-model="toRevAddr"
                            name="to-rev-addr"
                            type="text"
                            required
                            pattern="^[0-9a-zA-Z]{53}$"
                            class="peer border-b bg-transparent p-1 text-neutral-50 caret-neutral-200 outline-none"
                            :class="{
                                '[&:not(:focus)]:invalid:border-b-red-500':
                                    toRevAddr && toRevAddr.length > 0,
                            }"
                        />
                        <label
                            for="to-rev-addr"
                            class="pointer-events-none absolute left-0 origin-left text-neutral-100 transition-transform ease-in peer-focus:-translate-y-5 peer-focus:scale-75"
                            :class="{
                                '-translate-y-5 scale-75':
                                    toRevAddr && toRevAddr.length > 0,
                            }"
                            >To Address</label
                        >
                    </div>
                    <div class="relative">
                        <input
                            v-model="amount"
                            required
                            name="amount"
                            type="number"
                            min="10000"
                            class="peer border-b bg-transparent p-1 text-neutral-50 caret-neutral-200 outline-none"
                            :class="{
                                '[&:not(:focus)]:invalid:border-b-red-500':
                                    amount && amount > 0,
                            }"
                        />
                        <label
                            for="amount"
                            class="pointer-events-none absolute left-0 origin-left text-neutral-100 transition-transform ease-in peer-focus:-translate-y-5 peer-focus:scale-75"
                            :class="{
                                '-translate-y-5 scale-75': amount && amount > 0,
                            }"
                            >Amount</label
                        >
                    </div>
                    <div class="flex gap-14">
                        <button
                            class="text-shadow font-josefin_sans text-xl text-white"
                            @click="transfer"
                        >
                            Transfer
                        </button>
                        <button
                            class="font-josefin_sans text-xl text-neutral-300"
                            @click="$emit('onBack')"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <LoadingSpinner :status="transferStatus" />
    </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue'
import type { AsyncDataRequestStatus } from 'nuxt/dist/app/composables/asyncData'
import type { PostTransfer, RevAccount } from '~/models'

defineEmits(['onBack'])

const toRevAddr = ref<string>()
const amount = ref<number>()
const transferStatus = ref<AsyncDataRequestStatus>('idle')
const account = useAccount()
const toast = useToast()

async function transfer() {
    if (!verify(toRevAddr.value, amount.value)) {
        toast.error('Please enter a valid address or amount')
        return
    }
    transferStatus.value = 'pending'

    const revAccount = account.value as RevAccount
    const { deploy, signature } = await createDeploy(
        revAccount,
        `new deployId(\`rho:rchain:deployId\`), deployer(\`rho:rchain:deployerId\`) in {
            @"Transfer"!(*deployer, "${revAccount.revAddr}", "${toRevAddr.value}", ${amount.value}, *deployId)
        }`,
    )

    const { error } = await $fetch<PostTransfer.Res>('/api/transfer', {
        method: 'POST',
        body: {
            deploy,
            signature,
        } as PostTransfer.Req,
    })

    if (error) {
        transferStatus.value = 'error'
        toast.error(`Transfer failed: ${error ?? 'unknown error'}`)
    } else {
        transferStatus.value = 'success'
        toast.success(`Transfer successful`)
    }
}

function verify(toRevAddr?: string, amount?: number) {
    return (
        toRevAddr &&
        amount &&
        /^[0-9a-zA-Z]{53}$/.test(toRevAddr) &&
        Number.isSafeInteger(amount) &&
        amount > 10000
    )
}
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button {
    display: none;
}
button:hover:not(:disabled).text-shadow {
    text-shadow: 0 0 4px #fff;
}
</style>
