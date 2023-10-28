import _ from 'lodash'
import { useLogger } from '@nuxt/kit'

import Constant from './constant'
import { CarCtrl, Bullet, Car, CarStatus, GameState, Vec2 } from '~/models/game'
import { RoomUserData } from '~/models/room'

const logger = useLogger('Player Control')

export function handlePlayerCtrl(
    ctrl: CarCtrl,
    userData: RoomUserData,
    state: GameState,
    onStateChange: () => void,
) {
    const { cars, bullets } = state
    const { player, userConfig, carEngine: engine } = userData
    const self = cars.get(player)!

    /* -------------------------------- Direction ------------------------------- */
    if (ctrl.left) {
        engine.angleVelocity -= (engine.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }
    if (ctrl.right) {
        engine.angleVelocity += (engine.power > 0 ? 1 : -1) * Constant.TurnSpeed
    }

    /* --------------------------- Velocity & Position -------------------------- */
    if (ctrl.forward) {
        engine.power += Constant.PowerFactor
    }
    if (ctrl.backward) {
        engine.power -= Constant.ReverseFactor
    }
    engine.power = _.clamp(engine.power, Constant.MinPower, Constant.MaxPower)

    /* ---------------------------------- Bullet --------------------------------- */
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
            onStateChange()
        }
    }
    logger.debug(`Update ${self.name} state:\n`, {
        cars,
        bullets,
    })
}
