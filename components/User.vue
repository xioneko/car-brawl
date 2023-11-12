<template>
    <div>
        <img
            class="cursor-pointer hover:brightness-150"
            src="~/assets/icons/user.svg"
            :class="{ 'brightness-150': openPopover }"
            width="24"
            alt="User"
            @click="openPopover = !openPopover"
        />
        <Transition>
            <div
                v-if="openPopover"
                ref="popover"
                class="absolute right-0 top-7 flex w-52 flex-col items-center rounded-md bg-neutral-700 pt-5 shadow-md"
            >
                <template v-if="account.type === AccountType.Registered">
                    <button
                        class="flex w-28 items-center justify-center gap-1 rounded-full bg-orange-300/20 py-1 text-[10px] text-orange-300"
                        @click.stop="copyAddrToClipboard"
                    >
                        <template v-if="!copied">
                            <span>{{ address }}</span>
                            <img
                                src="~/assets/icons/copy.svg"
                                alt="copy"
                                width="16"
                            />
                        </template>
                        <template v-else>
                            <span class="text-xs">copied</span>
                        </template>
                    </button>
                    <div class="relative mt-7 text-center">
                        <span
                            class="absolute -left-7 top-1 text-xs text-neutral-300"
                            >REV</span
                        >
                        <span class="text-2xl text-neutral-50">{{
                            balance
                        }}</span>
                        <span
                            class="absolute -right-9 top-3 text-xs text-neutral-300"
                            >×10<sup>-8</sup></span
                        >
                    </div>
                    <button
                        class="mb-4 mt-6 block rounded-lg bg-orange-500/95 px-12 py-1 text-base text-white hover:bg-orange-400"
                        @click="$emit('onTransfer'), (openPopover = false)"
                    >
                        Transfer
                    </button>
                </template>
                <template v-else>
                    <div class="mt-5 text-xl text-neutral-300">
                        Guest Account
                    </div>
                    <div class="mt-4 text-xs text-neutral-400">
                        Please login through Metamask
                    </div>
                    <NuxtLink
                        class="mb-9 mt-2 text-xs text-neutral-400 underline"
                        to="/"
                        >Back to home page</NuxtLink
                    >
                </template>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import type { GetBalance, RevAccount } from '~/models'

defineEmits(['onTransfer'])

const logger = useLogger('User')
const openPopover = ref<boolean>(false)
const popover = ref<HTMLElement | null>(null)
const copied = ref<boolean>(false)
const account = useAccount()
const balanceAsync = useLazyFetch<GetBalance.Res>(`api/balance`, {
    params: {
        revAddr: (account.value as RevAccount).revAddr,
    } as GetBalance.Req,
    immediate: false,
})
const balance = computed(() => {
    switch (account.type) {
        case AccountType.Registered: {
            const balance = balanceAsync.data?.value?.amount
            return balance?.toLocaleString() ?? 'Updating...'
        }
        case AccountType.Guest: {
            return null
        }
    }
})
const address = computed(() => {
    switch (account.type) {
        case AccountType.Registered: {
            const revAccount = account.value as RevAccount
            return (
                revAccount.revAddr.slice(0, 5) +
                '...' +
                revAccount.revAddr.slice(-5)
            )
        }
        case AccountType.Guest: {
            return null
        }
    }
})

watch(openPopover, (isOpen) => {
    if (isOpen) {
        if (account.type === AccountType.Registered) balanceAsync.refresh()
        setTimeout(() => {
            const inactiveListener = (event: MouseEvent) => {
                // 判断鼠标是否点击在 popover 内
                if (!popover.value?.contains(event.target as Node)) {
                    logger.debug('Close popover')
                    openPopover.value = false
                    removeEventListener('click', inactiveListener)
                }
            }
            addEventListener('click', inactiveListener)
        }, 500)
    }
})

function copyAddrToClipboard() {
    if (account.type === AccountType.Registered) {
        navigator.clipboard.writeText((account.value as RevAccount).revAddr)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 1000)
    }
}
</script>

<style>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
