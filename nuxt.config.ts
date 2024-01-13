export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            socketPort: process.env.SOCKET_PORT,
        },
    },
    devtools: {
        enabled: false,
    },
    imports: {
        dirs: ['stores'],
    },
    modules: ['@nuxtjs/tailwindcss', 'nuxt-vitest'],

    nitro: {
        entry: '~/server/index.ts', // a hacky way to extend server capabilities
        serverAssets: [
            {
                baseName: 'contracts',
                dir: '../contracts',
            },
        ],
    },
})
