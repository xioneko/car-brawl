import _ from 'lodash'
import { Server } from 'socket.io'
import ms from 'ms'
import { SystemRevAddr, sendDeploy } from '../rchain/http'
import { Room } from './Room'
import {
    GameState,
    RoomType,
    ClientEvents,
    ServerEvents,
    Constant,
} from '~/models'

const logger = useLogger('CarBrawlServer')

interface ClientData {
    socketId: string
    room: Room<GameState> | null
    disconnectedSince: number | null
}

export class CarBrawlServer {
    private io: Server<ClientEvents, ServerEvents>

    private clients: Map<string, ClientData> = new Map()

    private roomRegistry: {
        [type in RoomType]: new (server: Server) => Room<any, any>
    }

    private rooms: Set<Room<GameState>> = new Set()

    constructor(
        port: number,
        roomRegistry: {
            [type in RoomType]: new (server: Server) => Room<any, any>
        },
    ) {
        this.roomRegistry = roomRegistry

        this.io = new Server(port, {
            cors: {
                origin: `http://localhost:${process.env.PORT}`,
            },
        })

        this.io.on('connection', (socket) => {
            logger.info(`Client ${socket.id} Connected`)

            socket.on('joinRoom', (player, type, options) => {
                // logger.debug(`Receive "joinRoom" event from ${player}`)

                const client = this.clients.get(player)

                let room = client?.room
                let rejoin: boolean = false
                if (room && room._available && room.type === type) {
                    rejoin = true

                    // 客户端可能意外断连
                    client!.socketId = socket.id
                    client!.disconnectedSince = null

                    socket.emit('joinStatus', true)
                } else {
                    room = this.findRoom(type)

                    const [success, error] = room!.onAuth(player, options)
                    if (success) {
                        socket.emit('joinStatus', true)

                        this.clients.set(player, {
                            socketId: socket.id,
                            room,
                            disconnectedSince: null,
                        })
                        this.rooms.add(room)
                    } else {
                        socket.emit('joinStatus', false, error)
                        return
                    }
                }

                socket.join(room!.roomId)
                room!.onJoin(player, options, rejoin)

                logger.info(
                    `${player} ${rejoin ? 'rejoin' : 'join'} the room ${
                        room!.roomId
                    }}`,
                )
            })

            socket.on('leaveRoom', (player) => {
                this.leaveRoom(player)
                logger.info(`${player} leave the room`)
            })

            socket.on('carCtrl', (player, ctrl) => {
                const room = this.clients.get(player)!.room
                room?.onCarCtrl(player, ctrl)
            })

            socket.onAny((eventName, player, ...args) => {
                if (['joinRoom', 'leaveRoom', 'carCtrl'].includes(eventName))
                    return
                logger.debug(`Receive "${eventName}" event from ${player}`)
                const room = this.clients.get(player)!.room!
                room._handle(eventName, player, args)
            })

            socket.on('disconnect', (reason) => {
                logger.info(`Client ${socket.id} disconnected: ${reason}`)
                const client = _.find(Array.from(this.clients.values()), {
                    socketId: socket.id,
                })
                if (client) {
                    client.disconnectedSince = Date.now()
                    logger.debug(
                        `client ${socket.id} last disconnection: ${client.disconnectedSince}`,
                    )
                }
            })
        })
    }

    findRoom(type: RoomType) {
        const existRoom = _.find(Array.from(this.rooms), (room) => {
            return (
                room._available &&
                room.type === type &&
                this.numOfPlayersIn(room.roomId) < room.maxPlayers
            )
        })
        if (existRoom) {
            // logger.debug(`Find existing room ${existRoom.roomId}`)
            return existRoom
        } else {
            const RoomCtor = this.roomRegistry[type]!
            return new RoomCtor(this.io)
        }
    }

    async hostGame() {
        try {
            const deploy = await createSysDeployReq(
                `@"CarBrawl"!({"host": "${SystemRevAddr}", "cost": ${
                    process.dev ? 1_000 : 100_000
                }})`,
            )
            await sendDeploy(deploy)
            await checkDeployStatus(
                deploy.signature,
                (errored, systemDeployError) => {
                    throw new Error(
                        'Does the deployer has enough REV? ' +
                            systemDeployError,
                    )
                },
            )
            logger.success('Host game deploy success')
        } catch (error) {
            logger.error('Host game deploy failed:', error)
        }
    }

    startStateSyncLoop() {
        setInterval(() => {
            if (_.isEmpty(this.clients)) return

            for (const room of this.rooms.values()) {
                if (!room._available) this.disposeRoom(room)
                room.nextTick()

                if (!room._modified) continue
                room._modified = false

                room.onBeforeSync?.()
                this.io.to(room.roomId).volatile.emit('stateSync', room.state)
            }
        }, 1000 / Constant.TickRate)
    }

    startClearConnectionLoop() {
        setInterval(() => {
            for (const [player, { disconnectedSince }] of this.clients) {
                if (
                    disconnectedSince &&
                    Date.now() - disconnectedSince > ms('15 min')
                ) {
                    this.removeClient(player)
                    logger.info(
                        `Since the server has not received any messages from the client ${player} for too long, the client is automatically removed from the room`,
                    )
                }
            }
        }, ms('10 min'))
    }

    private numOfPlayersIn(roomId: string) {
        return _.filter(
            Array.from(this.clients.values()),
            (client) => client.room?.roomId === roomId,
        ).length
    }

    private removeClient(player: string) {
        this.leaveRoom(player)
        this.clients.delete(player)
    }

    private leaveRoom(player: string) {
        const client = this.clients.get(player)
        if (!client || !client.room) return

        client.room.onLeave(player)
        client.room = null
    }

    private disposeRoom(room: Room<GameState>) {
        this.rooms.delete(room)
        room.onDispose()
        this.clients.forEach((client) => {
            if (client.room?.roomId === room.roomId) {
                client.room = null
            }
        })
    }
}
