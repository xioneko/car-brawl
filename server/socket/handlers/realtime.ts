import _ from 'lodash'
import {
    Bullet,
    Car,
    CarStatus,
    Constant,
    GameState,
    Vec2,
} from '~/models/game'
import { RoomUserData } from '~/models/room'

const logger = useLogger('Realtime Update')

export function realtimeUpdate(
    userData: Map<string, RoomUserData>,
    state: GameState,
    onStateChange?: () => void,
) {
    const { cars, bullets } = state
    for (const player of userData.keys()) {
        const self = cars.get(player)!
        const old = _.cloneDeep(self)

        /* -------------------------- Velocity & Direction -------------------------- */
        self.velocity.x += Math.sin(self.direction) * self.power
        self.velocity.y -= Math.cos(self.direction) * self.power

        const normalize = (value: number, max: number) => {
            if (value > max) value -= max
            if (value < 0) value += max
            return value
        }
        const round = (value: number, precision: number) => {
            return value > 0
                ? _.floor(value, precision)
                : _.ceil(value, precision)
        }

        self.position.x = normalize(
            self.position.x + self.velocity.x,
            Constant.MapWidth,
        )
        self.position.y = normalize(
            self.position.y + self.velocity.y,
            Constant.MapHeight,
        )
        self.direction = normalize(
            self.direction + self.angleVelocity,
            Math.PI * 2,
        )

        self.angleVelocity = round(self.angleVelocity * Constant.AngularDrag, 5)
        self.velocity.x = round(self.velocity.x * Constant.Drag, 2)
        self.velocity.y = round(self.velocity.y * Constant.Drag, 2)

        /* ------------------------------- Shot & Hit ------------------------------- */
        const reborn = (car: Car) => {
            car.position = new Vec2(
                _.random(0, Constant.MapWidth),
                _.random(0, Constant.MapHeight),
            )
            car.velocity = new Vec2(0, 0)
        }
        if (
            self.status === CarStatus.INVINCIBLE &&
            Date.now() > self.lastRebirthAt + Constant.InvincibleInterval
        ) {
            self.status = CarStatus.NORMAL
        }
        if (self.status === CarStatus.NORMAL) {
            let killer
            if ((killer = checkIfShot(self, bullets))) {
                self.status = CarStatus.DEATH
                cars.get(killer)!.points++
            } else if (checkIfHit(self, cars)) reborn(self)
        }

        if (!_.isEqual(self, old)) onStateChange?.()
    }

    /* --------------------------------- Bullet --------------------------------- */
    for (const bullet of bullets.values()) {
        bullet.lifespan--
        if (bullet.lifespan === 0) {
            bullets.delete(bullet)
        }
        bullet.position.x += bullet.velocity.x
        bullet.position.y -= bullet.velocity.y
        onStateChange?.()
    }
}

function checkIfShot(self: Car, bullets: Set<Bullet>) {
    if (self.status === CarStatus.INVINCIBLE) return
    for (const bullet of bullets.values()) {
        if (bullet.owner === self.player) continue

        const distance = Math.sqrt(
            (bullet.position.x - self.position.x) ** 2 +
                (bullet.position.y - self.position.y) ** 2,
        )
        if (distance < Constant.SafetyRadius) {
            // logger.debug(`${self.player} shot by ${bullet.owner}`)
            return bullet.owner
        }
    }
}

function checkIfHit(self: Car, cars: Map<string, Car>) {
    for (const [player, car] of cars) {
        if (player === self.player || car.status !== CarStatus.NORMAL) continue

        const distance = Math.sqrt(
            (car.position.x - self.position.x) ** 2 +
                (car.position.y - self.position.y) ** 2,
        )
        if (distance < Constant.SafetyRadius * 2) {
            // logger.debug(`${car.name} hit ${self.name}`)
            return car.player
        }
    }
}
