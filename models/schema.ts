// @ts-nocheck
import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

export class Vec2 extends Schema {
    @type('float32') x: number
    @type('float32') y: number
}

export enum CarStatus {
    SHOT = 'shot',
    HANG_UP = 'hang_up',
}

export class Car extends Schema {
    @type('int16') id: number
    @type('string') name: string
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type(Vec2) direction: Vec2
    @type('int16') points: number
    @type('string') status: CarStatus
    @type('string') nameColor: string
    @type('string') roofColor: string
    @type('string') bodyColor: string
}

export class Bullet extends Schema {
    @type('int16') owner: number
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type(Vec2) direction: Vec2
    @type('int32') lifespan: number
    @type('string') bodyColor: string
}

export class RoomState extends Schema {
    @type({ map: Car }) cars: MapSchema<Car>
    @type([Bullet]) bullets: ArraySchema<Bullet>
}
