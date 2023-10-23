// @ts-nocheck
import { MapSchema, Schema, SetSchema, type } from '@colyseus/schema'
import type { CarStyle, BulletStyle } from './config'

export class Vec2 extends Schema {
    @type('float32') x: number
    @type('float32') y: number

    constructor(x: number, y: number) {
        super()
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

export class Car extends Schema {
    @type('string') player: string
    @type('string') name: string
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type(float32) direction: number
    @type('int16') points: number
    @type('string') status: CarStatus
    @type('string') nameColor: string
    @type('string') roofColor: string
    @type('string') bodyColor: string

    constructor(
        player: string,
        name: string,
        position: { x: number; y: number },
        style: CarStyle,
    ) {
        super()
        this.player = player
        this.name = name
        this.position = new Vec2(position.x, position.y)
        this.velocity = new Vec2(0, 0)
        this.direction = 0
        this.points = 0
        this.status = CarStatus.NORMAL
        this.nameColor = style.name.string()
        this.roofColor = style.roof.string()
        this.bodyColor = style.body.string()
    }
}

export class Bullet extends Schema {
    @type('string') owner: string
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type('float32') direction: number
    @type('int32') lifespan: number
    @type('string') bodyColor: string

    constructor(
        owner: string,
        position: Vec2,
        velocity: Vec2,
        direction: number,
        lifespan: number,
        style: BulletStyle,
    ) {
        super()
        this.owner = owner
        this.position = position
        this.velocity = velocity
        this.direction = direction
        this.lifespan = lifespan
        this.bodyColor = style.body.string()
    }
}

export class RoomState extends Schema {
    @type({ map: Car }) cars: MapSchema<Car>
    @type([Bullet]) bullets: SetSchema<Bullet>

    constructor() {
        super()
        this.cars = new MapSchema<Car>()
        this.bullets = new SetSchema<Bullet>()
    }
}
