<template>
    <dialog
        ref="loadingSpinner"
        class="fixed inset-0 m-0 h-fit max-h-screen w-fit max-w-full overflow-visible bg-transparent p-0 outline-none backdrop-blur-sm"
    >
        <div class="flex h-screen w-screen items-center justify-center">
            <component
                :is="
                    [
                        LoadingSpinnerCubeShadow,
                        LoadingSpinnerCubeGrid,
                        LoadingSpinnerRotateSquare,
                        LoadingSpinnerLetterCube,
                        LoadingSpinnerRotateSquare2,
                    ].at(_.random(0, 4))
                "
            />
        </div>
    </dialog>
</template>

<script setup lang="ts">
import _ from 'lodash'
import type { AsyncDataRequestStatus } from 'nuxt/dist/app/composables/asyncData'
import {
    LoadingSpinnerCubeShadow,
    LoadingSpinnerCubeGrid,
    LoadingSpinnerRotateSquare,
    LoadingSpinnerLetterCube,
    LoadingSpinnerRotateSquare2,
} from '#components'

const props = withDefaults(
    defineProps<{
        status?: AsyncDataRequestStatus
    }>(),
    {
        status: 'idle',
    },
)
const loadingSpinner = ref<HTMLDialogElement>()

watchEffect(() => {
    switch (props.status) {
        case 'idle':
            loadingSpinner.value?.close()
            break
        case 'pending':
            loadingSpinner.value?.showModal()
            break
        case 'success':
            loadingSpinner.value?.close()
            break
        case 'error':
            loadingSpinner.value?.close()
            break
    }
})
</script>
