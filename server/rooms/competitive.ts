import { IncomingMessage } from 'node:http'
import colyseus from 'colyseus'
import { useLogger } from '@nuxt/kit'
import { format as prettyFormat } from 'pretty-format'
import { handlePlayerCtrl, handlePlayerJoin } from './handlers'
import { RoomState } from '~/models/schema'
import { MessageType } from '~/models/message'
import { RoomType, type RoomOptions } from '~/models/room'
import { PlayerCtrl } from '~/models/player-ctrl'

const logger = useLogger(RoomType.CompetitiveRoom)

export class CompetitiveRoom extends colyseus.Room<RoomState> {
    onCreate() {
        logger.info('New Room Created')
        this.setState(new RoomState())

        this.onMessage(
            MessageType.PlayerCtrl,
            (client, message: PlayerCtrl) => {
                // logger.debug(prettyFormat(message))
                handlePlayerCtrl(client, message, this.state)
            },
        )
    }

    onAuth(
        client: colyseus.Client,
        options: RoomOptions,
        request: IncomingMessage,
    ) {}

    onJoin(client: colyseus.Client, options: RoomOptions, auth: any) {
        // logger.info('New')
        handlePlayerJoin()
    }

    onLeave(client: colyseus.Client, consented: boolean) {}

    onDispose() {}
}
