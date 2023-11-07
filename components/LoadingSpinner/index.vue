<template>
    <dialog
        ref="loadingSpinner"
        class="absolute bg-transparent outline-none backdrop:bg-neutral-50/90"
    >
        <div class="h-32 w-32">
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
                class="absolute left-8 top-8"
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
