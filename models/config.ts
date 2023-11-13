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
        Sea: new Theme(Color.hsl(355, 85, 34), Color.hsl(349, 47, 19)),
        Ground: new Theme(Color.hsl(198, 100, 74), Color.hsl(196, 16, 94)),
        Tundra: new Theme(Color.hsl(120, 39, 40), Color.hsl(66, 36, 86)),
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
        Ferrari: new CarStyle(
            Color.hsl(0, 100, 50).alpha(0.25),
            Color.hsl(355, 100, 26).alpha(1),
            Color.hsl(3, 85, 44).alpha(1),
            Color.hsl(3, 85, 44).alpha(1),
        ),
        Bugatti: new CarStyle(
            Color.hsl(209, 90, 47).alpha(0.25),
            Color.hsl(205, 100, 72).alpha(1),
            Color.hsl(209, 90, 47).alpha(1),
            Color.hsl(209, 90, 47).alpha(1),
        ),
        Lamborghini: new CarStyle(
            Color.hsl(26, 100, 46).alpha(0.25),
            Color.hsl(25, 100, 61).alpha(1),
            Color.hsl(26, 100, 46).alpha(1),
            Color.hsl(26, 100, 46).alpha(1),
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
        dark: new BulletStyle(Color.hsl(0, 0, 5)),
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
