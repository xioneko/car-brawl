// @ts-nocheck
import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

class Vec2 extends Schema {
    @type('float32') x: number
    @type('float32') y: number
}

class Player extends Schema {
    @type('int16') id: number
    @type('string') name: string
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type(Vec2) direction: Vec2
    @type('int16') points: number
}

class Bullet extends Schema {
    @type('int16') owner: number
    @type(Vec2) position: Vec2
    @type(Vec2) velocity: Vec2
    @type(Vec2) direction: Vec2
    @type('int32') lifespan: number
}

export class RoomState extends Schema {
    @type({ map: Player }) players: MapSchema<Player>
    @type([Bullet]) bullets: ArraySchema<Bullet>
}
