import Color from 'color'

export class Theme {
    background: string
    foreground: string

    constructor(background: Color, foreground: Color) {
        this.background = background.string()
        this.foreground = foreground.string()
    }
}

export namespace Theme {
    export const presets = {
        default: new Theme(Color.hsl(0, 0, 95), Color.hsl(0, 0, 90)),
        dark: new Theme(Color.hsl(0, 0, 15), Color.hsl(0, 0, 20)),
        
    }
}

export class CarStyle {
    name: string
    roof: string
    body: string
    track: string

    constructor(
        nameColor: Color,
        roofColor: Color,
        bodyColor: Color,
        trackColor: Color,
    ) {
        this.name = nameColor.string()
        this.roof = roofColor.string()
        this.body = bodyColor.string()
        this.track = trackColor.string()
    }
}

export namespace CarStyle {
    export const presets = {
        default: new CarStyle(
            Color.hsl(0, 0, 0).alpha(0.5),
            Color.hsl(0, 0, 100).alpha(0.375),
            Color.hsl(0, 0, 50),
            Color.hsl(0, 0, 25).alpha(0.25),
        ),
        red: new CarStyle(
            Color.hsl(0, 0, 90),
            Color.hsl(0, 0, 80),
            Color.hsl(0, 0, 70),
            Color.hsl(0, 100, 50).alpha(0.25),
        ),
    }
}

export class BulletStyle {
    body: string
    constructor(bodyColor: Color) {
        this.body = bodyColor.string()
    }
}

export namespace BulletStyle {
    export const presets = {
        default: new BulletStyle(Color.hsl(0, 0, 15)),
        light: new BulletStyle(Color.hsl(0, 0, 80)),
    }
}

export class UserConfig {
    name: string
    theme: Theme
    carStyle: CarStyle
    bulletStyle: BulletStyle

    constructor(
        name: string = 'Anonymous',
        theme: Theme = Theme.presets.default,
        carStyle: CarStyle = CarStyle.presets.default,
        bulletStyle: BulletStyle = BulletStyle.presets.default,
    ) {
        this.name = name
        this.theme = theme
        this.carStyle = carStyle
        this.bulletStyle = bulletStyle
    }
}
