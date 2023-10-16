import { Server as HttpServer } from 'node:http'
import colyseus from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { TimedRoom } from './rooms/timed'
import { RoomType } from '~/models/room'

if (process.dev) {
    // @ts-ignore
    import('#internal/nitro/entries/nitro-dev')
} else {
    // @ts-ignore
    import('#internal/nitro/entries/node-server')
}

const nitroApp = useNitroApp()
const listener = toNodeListener(nitroApp.h3App)
const gameServer = new colyseus.Server({
    transport: new WebSocketTransport({
        server: new HttpServer(listener),
    }),
})
gameServer.define(RoomType.TimedRoom, TimedRoom)
gameServer.listen(4567)
