export default defineNuxtConfig({
    devtools: {
        enabled: false,
    },
    devServer: {
        port: 3000,
    },
    imports: {
        dirs: ['models', 'stores'],
    },
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
