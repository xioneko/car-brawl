import _ from 'lodash'
import type { RoomOptions, RoomUserData } from '~/models/room'
import { Car, GameState } from '~/models/game'

const logger = useLogger('Player Join')
if (process.dev) logger.level = 4

export function handlePlayerJoin(
    player: string,
    options: RoomOptions,
    userData: Map<string, RoomUserData>,
    state: GameState,
) {
    const config = options.userConfig

    userData.set(player, {
        player,
        userConfig: config,
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
