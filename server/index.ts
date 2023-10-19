import { Server as HttpServer } from 'node:http'
import colyseus from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { CompetitiveRoom } from './rooms/competitive'
import { RoomType } from '~/models/room'

if (process.dev) {
    // @ts-expect-error
    import('#internal/nitro/entries/nitro-dev')
} else {
    // @ts-expect-error
    import('#internal/nitro/entries/node-server')
}

const nitroApp = useNitroApp()
const listener = toNodeListener(nitroApp.h3App)
const gameServer = new colyseus.Server({
    transport: new WebSocketTransport({
        server: new HttpServer(listener),
    }),
})
gameServer.define(RoomType.CompetitiveRoom, CompetitiveRoom)
gameServer.listen(4567)
