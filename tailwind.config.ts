import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        './components/**/*.{vue,js,ts}',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
        './App.{js,ts,vue}',
        './app.{js,ts,vue}',
        './Error.{js,ts,vue}',
        './error.{js,ts,vue}',
    ],
    theme: {
        fontFamily: {
            body: ['JustForFun'],
        },
    },
    plugins: [],
    darkMode: 'class',
}
