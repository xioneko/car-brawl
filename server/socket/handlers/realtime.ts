import _ from 'lodash'
import { useLogger } from '@nuxt/kit'
import Constant from './constant'
import { Bullet, Car, CarStatus, GameState, Vec2 } from '~/models/game'
import { RoomUserData } from '~/models/room'

const logger = useLogger('Realtime Update')

export function realtimeUpdate(
    userData: Map<string, RoomUserData>,
    state: GameState,
    onStateChange: () => void,
) {
    const { cars, bullets } = state
    for (const [__, { player, carEngine: engine }] of userData) {
        const self = cars.get(player)!
        const old = _.cloneDeep(self)

        /* -------------------------- Velocity & Direction -------------------------- */
        self.velocity.x += Math.sin(self.direction) * engine.power
        self.velocity.y += Math.cos(self.direction) * engine.power
        const normalize = (value: number, max: number) => {
            if (value > max) value -= max
            if (value < 0) value += max
            return value
        }

        self.direction += engine.angleVelocity
        self.position.x = normalize(
            self.position.x + self.velocity.x,
            Constant.MapWidth,
        )
        self.position.y = normalize(
            self.position.y + self.velocity.y,
            Constant.MapHeight,
        )

        engine.angleVelocity *= Constant.AngularDrag
        self.velocity.x *= Constant.Drag

        /* ------------------------------- Shot & Hit ------------------------------- */
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

        if (!_.isEqual(self, old)) onStateChange()
    }

    /* --------------------------------- Bullet --------------------------------- */
    for (const bullet of bullets.values()) {
        bullet.lifespan--
        if (bullet.lifespan === 0) {
            bullets.delete(bullet)
        }
        bullet.position.x += bullet.velocity.x
        bullet.position.y -= bullet.velocity.y
        onStateChange()
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
