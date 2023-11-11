export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            wsPort: process.env.SOCKET_PORT,
        },
    },
    devtools: {
        enabled: false,
    },
    imports: {
        dirs: ['stores'],
    },
    css: ['~/assets/less/main.less'],
    modules: ['@pinia/nuxt'],

    nitro: {
        entry: '~/server/index.ts',
    },

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
})
