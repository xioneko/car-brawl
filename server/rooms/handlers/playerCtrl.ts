import colyseus from 'colyseus'
import { PlayerCtrl } from '~/models/player-ctrl'
import { RoomState } from '~/models/schema'

export function handlePlayerCtrl(
    client: colyseus.Client,
    message: PlayerCtrl,
    state: RoomState,
) {}
