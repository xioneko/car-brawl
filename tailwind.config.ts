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
            narnialone: ['Narnialone', 'sans-serif'],
            aller: ['Aller_Std_It', 'sans-serif'],
            just_for_fun: ['just_for_fun', 'sans-serif'],
        },
    },
    plugins: [],
    darkMode: 'class',
}
