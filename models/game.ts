import type { CarStyle, BulletStyle } from './config'

export class Vec2 {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export enum CarStatus {
    NORMAL = 'normal',
    SHOT = 'shot',
    HANG_UP = 'hang_up',
    HIT = 'hit',
}

export interface CarEngine {
    power: number
    angleVelocity: number
    lastShootAt: number
}

export class Car {
    player: string
    name: string
    position: Vec2
    velocity: Vec2
    direction: number
    points: number
    status: CarStatus
    style: CarStyle

    constructor(
        player: string,
        name: string,
        position: { x: number; y: number },
        style: CarStyle,
    ) {
        this.player = player
        this.name = name
        this.position = new Vec2(position.x, position.y)
        this.velocity = new Vec2(0, 0)
        this.direction = 0
        this.points = 0
        this.status = CarStatus.NORMAL
        this.style = style
    }
}

export class Bullet {
    owner: string
    position: Vec2
    velocity: Vec2
    direction: number
    lifespan: number
    style: BulletStyle

    constructor(
        owner: string,
        position: Vec2,
        velocity: Vec2,
        direction: number,
        lifespan: number,
        style: BulletStyle,
    ) {
        this.owner = owner
        this.position = position
        this.velocity = velocity
        this.direction = direction
        this.lifespan = lifespan
        this.style = style
    }
}

export class GameState {
    cars: Map<string, Car>
    bullets: Set<Bullet>

    constructor() {
        this.cars = new Map<string, Car>()
        this.bullets = new Set<Bullet>()
    }

    toJSON() {
        return {
            cars: [...this.cars.entries()],
            bullets: [...this.bullets],
        }
    }

    static fromJSON(json: any) {
        const state = new GameState()
        state.cars = new Map<string, Car>(json.cars)
        state.bullets = new Set<Bullet>(json.bullets)
        return state
    }
}

export interface CarCtrl {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
    shoot: boolean
}
