export type Theme = 'Classic' | 'Dark'

export type CarStyle = 'Classic' | 'Blue' | 'Red'

export interface UserConfig {
    name: string
    theme: Theme
    carStyle: CarStyle
}
