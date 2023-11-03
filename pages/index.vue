<template>
    <div>
        <div
            class="absolute left-1/2 top-1/2 inline-flex w-60 -translate-x-1/2 -translate-y-1/2 flex-col gap-5"
        >
            <button
                class="inline-block rounded-lg border border-orange-400 p-2 text-left text-neutral-600 shadow-md hover:bg-orange-200/10"
                @click="connectMetamask"
            >
                Connect Metamask
            </button>
            <button
                class="inline-block rounded-lg border border-orange-400 p-2 text-left text-neutral-600 shadow-md hover:bg-orange-200/10"
            >
                <NuxtLink to="/play">Guest Mode</NuxtLink>
            </button>
        </div>
        <dialog
            ref="loadingSpinner"
            class="absolute bg-transparent outline-none backdrop:bg-neutral-50/90"
        >
            <div class="h-32 w-32">
                <component
                    :is="
                        [
                            LoadingCubeShadow,
                            LoadingCubeGrid,
                            LoadingRotateSquare,
                            LoadingLetterCube,
                            LoadingRotateSquare2,
                        ].at(_.random(0, 4))
                    "
                    class="absolute left-8 top-8"
                />
            </div>
        </dialog>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { useToast } from 'vue-toastification'
import {
    LoadingCubeShadow,
    LoadingCubeGrid,
    LoadingRotateSquare,
    LoadingLetterCube,
    LoadingRotateSquare2,
} from '#components'
import { type PostLogin } from '~/models'

const logger = useLogger('Index')
const toast = useToast()
const account = useAccountStore()
const loadingSpinner = ref<HTMLDialogElement>()

onMounted(() => {
    account.$reset()
})

let unwatchLoginStatus: any
onUnmounted(() => {
    unwatchLoginStatus()
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
        const { status: loginStatus, data: loginResponse } =
            useFetch<PostLogin.Res>('/api/login', {
                method: 'POST',
                body: { revAddr },
            })
        handleLoginRes(loginStatus, loginResponse)
    } else {
        toast.error('Is MetaMask extension installed?')
    }

    type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

    function handleLoginRes(
        loginStatus: Ref<AsyncDataRequestStatus>,
        loginResponse: Ref<PostLogin.Res | null>,
    ) {
        unwatchLoginStatus = watch(
            loginStatus,
            (status) => {
                switch (status) {
                    case 'idle':
                        break
                    case 'pending':
                        loadingSpinner.value?.showModal()
                        break
                    case 'success':
                        loadingSpinner.value?.close()
                        if (loginResponse.value?.registered) {
                            toast.success('Welcome back!')
                            navigateTo('/play')
                        } else if (loginResponse.value?.error) {
                            toast.error('Login failed. Please try again.')
                            logger.debug(loginResponse.value?.error)
                        } else {
                            toast.success(
                                'Congratulations, you have received a reward of 888888 REV!',
                            )
                            navigateTo('/play')
                        }
                        break
                    case 'error':
                        loadingSpinner.value?.close()
                        toast.error('Login failed. Please try again.')
                        break
                }
            },
            { immediate: true },
        )
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
