import { useLogger } from '@nuxt/kit'
import _ from 'lodash'
import type { RoomOptions, RoomUserData } from '~/models/room'
import { Car, GameState } from '~/models/game'

const logger = useLogger('Player Join')
if (process.dev) logger.level = 4

export function handlePlayerJoin(
    clientId: string,
    options: RoomOptions,
    userData: Map<string, RoomUserData>,
    state: GameState,
) {
    const player = options.playerId
    const config = options.userConfig

    userData.set(clientId, {
        player,
        userConfig: config,
        carEngine: {
            power: 0,
            angleVelocity: 0,
            lastShootAt: 0,
        },
    })

    state.cars.set(
        player,
        new Car(
            player,
            config.name,
            { x: _.random(0, 1500), y: _.random(0, 1500) },
            config.carStyle,
        ),
    )
}
