<template>
    <div>
        <!-- https://play.tailwindcss.com/egVNubuTXL -->
        <img
            class="cursor-pointer"
            src="~/assets/icons/user.svg"
            width="24"
            alt="User"
            @click="openPopover = !openPopover"
        />
        <Transition>
            <div
                v-if="openPopover"
                ref="popover"
                class="absolute right-0 top-7 flex h-40 w-52 flex-col items-center rounded-md bg-neutral-50 pt-5 shadow-md"
            >
                <template v-if="account.type === AccountType.Registered">
                    <button
                        class="block w-fit rounded-lg bg-neutral-200/50 px-3 py-1 text-xs text-neutral-500"
                    >
                        {{ address }}
                        <div class="relative mt-8 text-center text-neutral-600">
                    </button>
                        <span
                            class="absolute -left-7 top-1 text-xs text-neutral-400"
                            >REV</span
                        >
                        <span class="text-2xl">{{ balance }}</span>
                        <span
                            class="absolute -right-9 top-3 text-xs text-neutral-400"
                            >×10<sup>-8</sup></span
                        >
                    </div>
                    <button
                        class="mt-4 block w-full rounded-lg bg-orange-500 px-2 py-1 text-base text-white"
                        @click="$emit('market')"
                    >
                        Market
                    </button>
                </template>
                <template v-else>
                    <div class="mt-5 text-xl text-neutral-500">
                        Guest Account
                    </div>
                    <div class="mt-4 text-xs text-neutral-400">
                        Please login through Metamask
                    </div>
                    <NuxtLink
                        class="mt-2 text-xs text-neutral-400 underline"
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
defineEmits(['market'])
const a = false
const logger = useLogger('User')
const openPopover = ref<boolean>(false)
const popover = ref<HTMLElement | null>(null)
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
                    // logger.debug('Close popover')
                    openPopover.value = false
                    removeEventListener('click', inactiveListener)
                }
            }
            addEventListener('click', inactiveListener)
        }, 500)
    }
})
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
