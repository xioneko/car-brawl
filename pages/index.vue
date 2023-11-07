<template>
    <div>
        <PrettyContainer>
            <div class="flex h-full w-full">
                <div class="relative top-[14%] lg:top-[8%]">
                    <img
                        class="slide-in ml-6 w-[36em] lg:w-[44em]"
                        src="~/assets/images/cool-car.svg"
                        alt="Cool Car"
                        width="1840"
                        height="1080"
                    />
                </div>
                <div class="relative mx-auto self-center">
                    <p class="font-narnialone text-6xl font-bold text-white">
                        Car brawl
                    </p>
                    <p class="mt-6 font-aller text-sm leading-8 text-gray-300">
                        try this game and you will never regret it ! ! !
                    </p>
                    <div
                        class="mt-10 flex flex-col items-start gap-y-6 lg:justify-start"
                    >
                        <button
                            class="text-whit inline-block w-full rounded-lg border border-orange-300/75 p-2 text-center text-white hover:bg-orange-400/25"
                            @click="connectMetamask"
                        >
                            Connect Metamask
                        </button>
                        <button
                            class="text-whit inline-block w-full rounded-lg border border-orange-300/75 p-2 text-center text-white hover:bg-orange-400/25"
                        >
                            <NuxtLink to="/play">Guest Mode</NuxtLink>
                        </button>
                    </div>
                </div>
            </div>
        </PrettyContainer>

        <LoadingSpinner :status="loginStatus" />
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { useToast } from 'vue-toastification'
import type { AsyncDataRequestStatus } from 'nuxt/dist/app/composables/asyncData'
import { type PostLogin } from '~/models'

const loginStatus = ref<AsyncDataRequestStatus>('idle')
const logger = useLogger('Index')
const toast = useToast()
const account = useAccountStore()

onMounted(() => {
    account.$reset()
})

async function connectMetamask() {
    const base58 = await import('bs58')
    const sha3 = await import('js-sha3')
    const blake = await import('blakejs')

    if ('ethereum' in window) {
        // @ts-ignore
        const [ethAddr]: string[] = await window.ethereum.request({
            method: 'eth_requestAccounts',
        })
        const revAddr = createRevAddrFromEth(ethAddr)
        account.$patch({ value: { ethAddr, revAddr } })

        try {
            loginStatus.value = 'pending'
            const { registered, error } = await $fetch<PostLogin.Res>(
                '/api/login',
                {
                    method: 'POST',
                    body: { revAddr } as PostLogin.Req,
                },
            )
            if (registered) {
                loginStatus.value = 'success'
                toast.success('Welcome back!')
                await navigateTo('/play')
            } else if (error) {
                loginStatus.value = 'error'
                toast.error(
                    `Login failed: ${
                        error ?? 'unknown error'
                    }. Please try again later.`,
                )
                logger.debug(error)
            } else {
                loginStatus.value = 'success'
                toast.success(
                    'Congratulations, you have received a reward of 1888888 REV!',
                )
                await navigateTo('/play')
            }
        } catch (error) {
            loginStatus.value = 'error'
            logger.error(error)
            toast.error('Login failed. Please try again later.')
        }
    } else {
        toast.error('Is MetaMask extension installed?')
    }

    function createRevAddrFromEth(ethAddrRaw: string): string {
        const ethAddr = ethAddrRaw.replace(/^0x/, '')
        if (ethAddr.length !== 40)
            throw new Error('Unknown Eth Address format.')

        // Hash ETH address
        const ethAddrBytes = decodeBase16(ethAddr)
        const ethHash = sha3.keccak256(ethAddrBytes)

        // Add prefix with hash and calculate checksum (blake2b-256 hash)
        const prefix = { coinId: '000000', version: '00' }
        const payload = `${prefix.coinId}${prefix.version}${ethHash}`
        const payloadBytes = decodeBase16(payload)
        const checksum = blake
            .blake2bHex(payloadBytes, undefined, 32)
            .slice(0, 8)

        // Return REV address
        return encodeBase58(`${payload}${checksum}`)
    }

    function decodeBase16(hexStr: string) {
        const removed0x = hexStr.replace(/^0x/, '')
        const byte2hex = ([arr, bhi]: [number[], string], x: string) =>
            (bhi ? [[...arr, parseInt(`${bhi}${x}`, 16)], ''] : [arr, x]) as [
                number[],
                string,
            ]
        const [resArr] = Array.from(removed0x).reduce(byte2hex, [[], ''])
        return Uint8Array.from(resArr)
    }

    function encodeBase58(hexStr: string) {
        const bytes = decodeBase16(hexStr)
        return base58.encode(bytes)
    }
}
</script>

<style scoped>
.slide-in {
    animation: slideIn 1s ease-out;
    animation-fill-mode: forwards;
    transform: translateX(-100%); /* 初始位置在视图左侧 */
}

@keyframes slideIn {
    to {
        transform: translateX(0); /* 最终位置，回到原始位置 */
    }
}
</style>
