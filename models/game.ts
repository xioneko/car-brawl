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

export class Car {
    player: string
    name: string
    position: Vec2
    power: number
    velocity: Vec2
    angleVelocity: number
    direction: number
    lastShootAt: number
    lastBeShotAt: number
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
        this.power = 0
        this.velocity = new Vec2(0, 0)
        this.angleVelocity = 0
        this.direction = 0
        this.lastShootAt = 0
        this.lastBeShotAt = 0
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

export const Constant = {
    MapWidth: 1500,
    MapHeight: 1500,
    MaxPower: 0.08,
    MinPower: -0.04,
    PowerFactor: 0.0008,
    ReverseFactor: 0.0004,
    TurnSpeed: 0.0025,
    Drag: 0.95,
    AngularDrag: 0.85,
    SafetyRadius: 7.5,
    ShootInterval: 60,
    InvincibleInterval: 1024,
    BulletLifespan: 128,
}
