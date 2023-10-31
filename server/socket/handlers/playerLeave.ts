import { GameState } from '~/models/game'
import { RoomUserData } from '~/models/room'

export function handlePlayerLeave(
    playerId: string,
    userData: Map<string, RoomUserData>,
    state: GameState,
) {
    const { player } = userData.get(playerId)!
    state.cars.delete(player)
    userData.delete(playerId)
}
