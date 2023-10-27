import { CarBrawlServer } from './socket/CarBrawlServer'
import { CompetitiveRoom, FunRoom, SingleRoom } from './socket/rooms'
import { RoomType } from '~/models/room'

if (process.dev) {
    // @ts-expect-error
    import('#internal/nitro/entries/nitro-dev')
} else {
    // @ts-expect-error
    import('#internal/nitro/entries/node-server')
}

const port = parseInt(process.env.SOCKET_PORT!)

const server = new CarBrawlServer(port, {
    [RoomType.FunRoom]: FunRoom,
    [RoomType.CompetitiveRoom]: CompetitiveRoom,
    [RoomType.SingleRoom]: SingleRoom,
})
