<template>
    <div>
        <!-- https://play.tailwindcss.com/egVNubuTXL -->
        <img
            class="relative cursor-pointer"
            src="~/assets/icons/user.svg"
            width="24"
            alt="User"
            @click="openPopover = !openPopover"
        />
        <div
            v-if="openPopover"
            class="absolute right-0 top-7 flex h-40 w-52 flex-col items-center rounded-md bg-neutral-50 pt-5 shadow-md"
        >
            <template v-if="account.type === AccountType.Registered">
                <button
                    class="block w-fit rounded-lg bg-neutral-200/50 px-3 py-1 text-xs text-neutral-500"
                >
                    {{ address }}
                </button>
                <div class="relative mt-8 text-center text-neutral-600">
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
            </template>
            <template v-else>
                <div class="mt-5 text-xl text-neutral-500">Guest Account</div>
                <div class="mt-4 text-xs text-neutral-400">
                    Please login through Metamask
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { GetBalance, RevAccount } from '~/models'

const openPopover = ref<boolean>(false)
const account = useAccountStore()
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
    if (isOpen && account.type === AccountType.Registered) {
        balanceAsync.refresh()
    }
})
</script>
