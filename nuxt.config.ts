export default defineNuxtConfig({
    devtools: {
        enabled: false,
    },
    devServer: {
        port: 3000,
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    nitro: {
        entry: '~/server/index.ts',
    },
})
