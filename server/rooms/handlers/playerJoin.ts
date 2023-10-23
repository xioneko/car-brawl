import colyseus from 'colyseus'
import {
    isGuestOptions,
    isRegularOptions,
    type RoomOptions,
    type RoomUserData,
} from '~/models/room'
import { RoomState } from '~/models/schema'
import { getConfigById } from '~/server/database/userConfig'

export async function handlePlayerJoin(
    room: colyseus.Room<RoomState>,
    client: colyseus.Client<RoomUserData>,
    options: RoomOptions,
) {
    if (isRegularOptions(options)) {
        const id = options.account.revAddr
        client.userData = {
            player: id,
            userConfig: await getConfigById(id),
            carEngine: {
                power: 0,
                angleVelocity: 0,
                lastShootAt: 0,
            },
        }
    } else if (isGuestOptions(options)) {
        client.userData = {
            player: options.account.id,
            userConfig: options.userConfig,
            carEngine: {
                power: 0,
                angleVelocity: 0,
                lastShootAt: 0,
            },
        }
    }
}
