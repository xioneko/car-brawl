import _ from 'lodash'
import { useLogger } from '@nuxt/kit'

import { CarCtrl, Bullet, Car, CarStatus, GameState, Vec2 } from '~/models/game'
import { RoomUserData } from '~/models/room'

const logger = useLogger('Player Control')

const Constant = {
    MapWidth: 1500,
    MapHeight: 1500,
    MaxPower: 0.075,
    MinPower: -0.0375,
    PowerFactor: 0.001,
    ReverseFactor: 0.0005,
    TurnSpeed: 0.002,
    Drag: 0.95,
    AngularDrag: 0.95,
    SafetyRadius: 7.5,
    ShootInterval: 60,
    BulletLifespan: 72,
}

export function handlePlayerCtrl(
    ctrl: CarCtrl,
    userData: RoomUserData,
    state: GameState,
) {
    const { cars, bullets } = state
    const { player, userConfig, carEngine: engine } = userData
    const self = cars.get(player)!

    /* ------------------------------- Hit & Shot ------------------------------- */
    const killer = checkIfShot(self, bullets)
    if (killer) {
        self.status = CarStatus.SHOT
        cars.get(killer)!.points++
    } else if (checkIfHit(self, cars)) {
        self.status = CarStatus.HIT
    } else {
        self.status = CarStatus.NORMAL
    }
    if (self.status === CarStatus.HIT || self.status === CarStatus.SHOT) {
        self.position = new Vec2(
            _.random(0, Constant.MapWidth),
            _.random(0, Constant.MapHeight),
        )
        self.velocity = new Vec2(0, 0)
    }

    /* -------------------------------- Direction ------------------------------- */
    if (ctrl.left) {
        engine.angleVelocity -= (engine.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }
    if (ctrl.right) {
        engine.angleVelocity += (engine.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }
    self.direction += engine.angleVelocity
    engine.angleVelocity *= Constant.AngularDrag

    /* --------------------------- Velocity & Position -------------------------- */
    if (ctrl.forward) {
        engine.power += Constant.PowerFactor
    }
    if (ctrl.backward) {
        engine.power -= Constant.ReverseFactor
    }
    engine.power = _.clamp(engine.power, Constant.MinPower, Constant.MaxPower)
    self.velocity.x += Math.sin(self.direction) * engine.power
    self.velocity.y += Math.cos(self.direction) * engine.power
    const normalize = (value: number, max: number) => {
        if (value > max) value -= max
        if (value < 0) value += max
        return value
    }
    self.position.x = normalize(
        self.position.x + self.velocity.x,
        Constant.MapWidth,
    )
    self.position.y = normalize(
        self.position.y + self.velocity.y,
        Constant.MapHeight,
    )
    self.velocity.x *= Constant.Drag

    /* ---------------------------------- Bullet --------------------------------- */
    for (const bullet of bullets.values()) {
        bullet.lifespan--
        if (bullet.lifespan === 0) {
            bullets.delete(bullet)
        }
        bullet.position.x += bullet.velocity.x
        bullet.position.y -= bullet.velocity.y
    }
    if (
        ctrl.shoot &&
        !(self.status === CarStatus.HIT || self.status === CarStatus.SHOT)
    ) {
        if (engine.lastShootAt < Date.now() - Constant.ShootInterval) {
            engine.lastShootAt = Date.now()
            const bullet = new Bullet(
                player,
                new Vec2(
                    self.position.x + Math.sin(self.direction) * 10,
                    self.position.y - Math.cos(self.direction) * 10,
                ),
                new Vec2(
                    self.velocity.x + Math.sin(self.direction) * 1.25,
                    self.velocity.y + Math.cos(self.direction) * 1.25,
                ),
                self.direction,
                Constant.BulletLifespan,
                userConfig.bulletStyle,
            )
            bullets.add(bullet)
        }
    }
    cars.set(player, self)
    logger.debug(`Update ${self.name} state:\n`, {
        cars,
        bullets,
    })
}

function checkIfHit(self: Car, cars: Map<string, Car>) {
    for (const [player, car] of cars) {
        if (player === self.player) continue

        const distance = Math.sqrt(
            (car.position.x - self.position.x) ** 2 +
                (car.position.y - self.position.y) ** 2,
        )
        if (distance < Constant.SafetyRadius * 2) {
            logger.debug(`${car.name} hit ${self.name}`)
            return car.player
        }
    }
}

function checkIfShot(self: Car, bullets: Set<Bullet>) {
    for (const bullet of bullets.values()) {
        if (bullet.owner === self.player) continue

        const distance = Math.sqrt(
            (bullet.position.x - self.position.x) ** 2 +
                (bullet.position.y - self.position.y) ** 2,
        )
        if (distance < Constant.SafetyRadius) {
            logger.debug(`${self.name} shot by ${bullet.owner}`)
            return bullet.owner
        }
    }
}
