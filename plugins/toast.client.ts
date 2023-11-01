import Toast, { POSITION, type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
    const options: PluginOptions = {
        position: POSITION.BOTTOM_CENTER,
    }
    nuxtApp.vueApp.use(Toast, options)
})
