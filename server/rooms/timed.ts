import { IncomingMessage } from 'node:http'
import colyseus from 'colyseus'
import { useLogger } from '@nuxt/kit'
import { handlePlayerCtrl, handlePlayerJoin } from './handlers'
import { RoomState } from '~/models/schema'
import { MessageType } from '~/models/message'
import type { RoomOptions } from '~/models/room'

const logger = useLogger('Timed Room')

export class TimedRoom extends colyseus.Room<RoomState> {
    onCreate() {
        this.onMessage(MessageType.playerCtrl, (client, message) => {
            logger.handlePlayerCtrl(client, message)
        })
    }

    onAuth(
        client: colyseus.Client,
        options: RoomOptions,
        request: IncomingMessage,
    ) {}

    // When client successfully join the room
    onJoin(client: colyseus.Client, options: RoomOptions, auth: any) {
        handlePlayerJoin()
    }

    // When a client leaves the room
    onLeave(client: colyseus.Client, consented: boolean) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
