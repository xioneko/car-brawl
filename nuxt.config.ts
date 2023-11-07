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
    modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

    nitro: {
        entry: '~/server/index.ts',
        serverAssets: [
            {
                baseName: 'contracts',
                dir: '../contracts',
            },
        ],
    },

    tailwindcss: {
        config: {
            theme: {
                fontFamily: {
                    narnialone: ['Narnialone', 'sans-serif'],
                    aller: ['Aller_Std_It', 'sans-serif'],
                    just_for_fun: ['just_for_fun', 'sans-serif'],
                },
            },
            content: [
                './app.vue',
                './components/**/*.{vue,ts}',
                './layouts/**/*.vue',
                './pages/**/*.vue',
                './composables/**/*.ts',
                './plugins/**/*.ts',
                './utils/**/*.ts',
                './nuxt.config.ts',
            ],
        },
    },
})
