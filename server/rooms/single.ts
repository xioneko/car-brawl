import { IncomingMessage } from 'node:http'
import colyseus from 'colyseus'
import { useLogger } from '@nuxt/kit'
import { format as prettyFormat } from 'pretty-format'
import { handlePlayerCtrl, handlePlayerJoin } from './handlers'
import { RoomState } from '~/models/schema'
import { MessageType } from '~/models/message'
import { RoomType, type RoomOptions } from '~/models/room'
import { PlayerCtrl } from '~/models/playerCtrl'

const logger = useLogger(RoomType.SingleRoom)

export class SingleRoom extends colyseus.Room<RoomState> {
    onCreate() {
        logger.info('New Room Created')
        this.onMessage(
            MessageType.PlayerCtrl,
            (client, message: PlayerCtrl) => {
                logger.debug(prettyFormat(message))
                handlePlayerCtrl(this, client, message)
            },
        )
    }

    onAuth(
        client: colyseus.Client,
        options: RoomOptions,
        request: IncomingMessage,
    ) {}

    // When client successfully join the room
    onJoin(client: colyseus.Client, options: RoomOptions, auth: any) {
        // logger.info('New')
        handlePlayerJoin(this, client, options)
    }

    // When a client leaves the room
    onLeave(client: colyseus.Client, consented: boolean) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
