import _ from 'lodash'
import {
    CarCtrl,
    Bullet,
    Car,
    CarStatus,
    GameState,
    Vec2,
    Constant,
} from '~/models/game'
import { RoomUserData } from '~/models/room'

const logger = useLogger('Player Control')

export function handlePlayerCtrl(
    ctrl: CarCtrl,
    userData: RoomUserData,
    state: GameState,
    onStateChange: () => void,
) {
    const { cars, bullets } = state
    const { player, userConfig } = userData
    const self = cars.get(player)!
    /* --------------------------------- Reborn --------------------------------- */
    const reborn = (car: Car) => {
        car.position = new Vec2(
            _.random(0, Constant.MapWidth),
            _.random(0, Constant.MapHeight),
        )
        car.velocity = new Vec2(0, 0)
    }
    if (self.status === CarStatus.DEATH) {
        // logger.debug(`${self.name} is to be reborn`)
        reborn(self)
        self.lastRebirthAt = Date.now()
        self.status = CarStatus.INVINCIBLE
    }

    /* -------------------------------- Direction ------------------------------- */
    if (ctrl.left && self.velocity.lengthSquare > 0) {
        self.angleVelocity -= (self.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }
    if (ctrl.right && self.velocity.lengthSquare > 0) {
        self.angleVelocity += (self.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }

    /* --------------------------- Velocity & Position -------------------------- */
    if (ctrl.forward) {
        self.power += Constant.PowerFactor
    } else if (self.power > 0) {
        self.power = Math.max(0, self.power - Constant.PowerFactor)
    }
    if (ctrl.backward) {
        self.power -= Constant.ReverseFactor
    } else if (self.power < 0) {
        self.power = Math.min(0, self.power + Constant.ReverseFactor)
    }
    self.power = _.clamp(self.power, Constant.MinPower, Constant.MaxPower)

    /* ---------------------------------- Bullet --------------------------------- */
    if (ctrl.shoot && self.status !== CarStatus.INVINCIBLE) {
        if (Date.now() > self.lastShootAt + Constant.ShootInterval) {
            self.lastShootAt = Date.now()
            const bullet = new Bullet(
                player,
                new Vec2(
                    self.position.x + Math.sin(self.direction) * 10,
                    self.position.y - Math.cos(self.direction) * 10,
                ),
                new Vec2(
                    self.velocity.x * 1.5 + Math.sin(self.direction) * 1.2,
                    -self.velocity.y * 1.5 + Math.cos(self.direction) * 1.2,
                ).constrain(Constant.BulletMinSpeed),
                self.direction,
                Constant.BulletLifespan,
                userConfig.bulletStyle,
            )
            // logger.debug('Add Bullet', bullet)
            bullets.add(bullet)
        }
    }
    onStateChange()
    // logger.debug(`Update ${self.name} state:\n`, {
    //     cars,
    //     bullets,
    // })
}
