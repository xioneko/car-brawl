// @ts-ignore
import * as Toast from 'vue-toastification/dist/index.mjs'
import * as ToastType from 'vue-toastification/dist/types/index'

export const useToast: typeof ToastType.useToast = () => {
    return Toast.useToast()
}
