import type Color from 'color'

export type Theme = {
    background: Color
    foreground: Color
}

export type CarStyle = {
    name: Color
    roof: Color
    body: Color
}

export type BulletStyle = {
    body: Color
}

export interface UserConfig {
    theme: Theme
    carStyle: CarStyle
    bulletStyle: BulletStyle
}
