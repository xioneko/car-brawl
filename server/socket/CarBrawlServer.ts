import _ from 'lodash'
import { Server, Socket } from 'socket.io'
import { useLogger } from '@nuxt/kit'
import { Room } from './Room'
import { ClientEvents, ServerEvents } from '~/models/events'
import { RoomType } from '~/models/room'

const logger = useLogger('CarBrawlServer')

export class CarBrawlServer {
    private io: Server<ClientEvents, ServerEvents>

    private rooms: Map<string, Room<any, any>> = new Map()

    private roomOfClient: Map<string, string> = new Map()

    private tickRate: number = 128

    constructor(
        port: number,
        roomRegistry: {
            [type in RoomType]: new (server: Server) => Room<any, any>
        },
    ) {
        this.io = new Server(port, {
            cors: {
                origin: `http://localhost:${process.env.PORT}`,
            },
        })

        this.io.on('connection', (socket) => {
            logger.info(`Client ${socket.id} Connected`)

            socket.on('joinRoom', (type, options) => {
                logger.debug(`Receive "joinRoom" event from ${socket.id}`)

                let room = _.find(Array.from(this.rooms.values()), (room) => {
                    return (
                        room.type === type &&
                        _.filter(Array.from(this.roomOfClient.values()), {
                            roomId: room.roomId,
                        }).length < room.maxPlayers
                    )
                })
                if (!room) {
                    const RoomCtor = roomRegistry[type]!
                    room = new RoomCtor(this.io)
                    this.rooms.set(room.roomId, room)
                } else {
                    logger.debug(`Find existing room ${room.roomId}`)
                }

                this.joinRoom(socket, room)
                room.onJoin(socket.id, options)
            })

            socket.on('leaveRoom', () => {
                const room = this.findRoom(socket)!
                room.onLeave(socket.id)
                this.leaveRoom(socket, room)
            })

            socket.on('carCtrl', (ctrl) => {
                const room = this.findRoom(socket)!
                room.onCarCtrl(socket.id, ctrl)
            })

            socket.onAny((eventName, ...args) => {
                if (['joinRoom', 'leaveRoom', 'carCtrl'].includes(eventName))
                    return
                logger.debug(`Receive "${eventName}" event from ${socket.id}`)
                const room = this.findRoom(socket)!
                room._handle(eventName, args)
            })

            socket.on('disconnect', (reason) => {
                logger.info(`Client ${socket.id} disconnected: ${reason}`)
            })
        })

        this.startSyncProgress()
    }

    joinRoom(client: Socket, room: Room<any, any>) {
        client.join(room.roomId)
        this.roomOfClient.set(client.id, room.roomId)
    }

    leaveRoom(client: Socket, room: Room<any, any>) {
        client.leave(room.roomId)
        this.roomOfClient.delete(client.id)
        if (!_.find(Array.from(this.roomOfClient), { roomId: room.roomId })) {
            room.onDispose()
            this.rooms.delete(room.roomId)
        }
    }

    findRoom(client: Socket) {
        const roomId = this.roomOfClient.get(client.id)!
        return this.rooms.get(roomId)
    }

    setTickRate(perSecond: number) {
        this.tickRate = perSecond
    }

    startSyncProgress() {
        setInterval(() => {
            if (_.isEmpty(this.rooms)) return

            for (const room of this.rooms.values()) {
                room.nextTick()
                if (!room._modified) continue
                room.onBeforeSync?.()
                this.io.to(room.roomId).volatile.emit('stateSync', room.state)
                room._modified = false
            }
        }, 1000 / this.tickRate)
    }
}
