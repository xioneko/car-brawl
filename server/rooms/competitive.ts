import { IncomingMessage } from 'node:http'
import colyseus from 'colyseus'
import { useLogger } from '@nuxt/kit'
import { format as prettyFormat } from 'pretty-format'
import { handlePlayerCtrl, handlePlayerJoin } from './handlers'
import { RoomState } from '~/models/schema'
import { MessageType } from '~/models/message'
import { RegularOptions, RoomOptions, RoomType } from '~/models/room'
import { PlayerCtrl } from '~/models/playerCtrl'

const logger = useLogger(RoomType.CompetitiveRoom)

export class CompetitiveRoom extends colyseus.Room<RoomState> {
    onCreate() {
        logger.info(`Room ${this.roomId} Created`)
        this.setState(new RoomState())
        this.setPatchRate(1000 / 120) // 120fps

        this.onMessage(
            MessageType.PlayerCtrl,
            (client, message: PlayerCtrl) => {
                // logger.debug(prettyFormat(message))
                handlePlayerCtrl(this, client, message)
            },
        )
    }

    onAuth(
        client: colyseus.Client,
        options: RegularOptions,
        request: IncomingMessage,
    ) {}

    async onJoin(client: colyseus.Client, options: RegularOptions, auth: any) {
        logger.info(
            `Player ${options.account.revAddr} join the room ${this.roomId}}`,
        )
        await handlePlayerJoin(this, client, options)
    }

    onLeave(client: colyseus.Client, consented: boolean) {}

    onDispose() {}
}
