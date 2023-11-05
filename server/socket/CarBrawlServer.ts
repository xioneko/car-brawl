import _ from 'lodash'
import { Server } from 'socket.io'
import { useLogger } from '@nuxt/kit'
import { SystemRevAddr, propose, sendDeploy } from '../rchain/http'
import { Room } from './Room'
import { ClientEvents, ServerEvents } from '~/models/events'
import { RoomType } from '~/models/room'
import { GameState } from '~/models'

const logger = useLogger('CarBrawlServer')

export class CarBrawlServer {
    private io: Server<ClientEvents, ServerEvents>

    private roomOfPlayer: Map<string, Room<GameState>> = new Map()
    private rooms: Set<Room<GameState>> = new Set()

    private tickRate: number = 128

    constructor(
        port: number,
        roomRegistry: {
            [type in RoomType]: new (server: Server) => Room<any, any>
        },
    ) {
        this.hostGame()

        this.io = new Server(port, {
            cors: {
                origin: `http://localhost:${process.env.PORT}`,
            },
        })

        this.io.on('connection', (socket) => {
            logger.info(`Client ${socket.id} Connected`)

            socket.on('joinRoom', (player, type, options) => {
                // logger.debug(`Receive "joinRoom" event from ${player}`)

                let room = this.roomOfPlayer.get(player)
                const rejoin = !_.isNil(room) && room.type === type
                if (!rejoin) {
                    const existRoom = _.find(
                        Array.from(this.roomOfPlayer.values()),
                        (room) => {
                            return (
                                room.type === type &&
                                this.numOfPlayersIn(room.roomId) <
                                    room.maxPlayers
                            )
                        },
                    )
                    if (existRoom) {
                        room = existRoom
                        logger.debug(`Find existing room ${existRoom.roomId}`)
                    } else {
                        const RoomCtor = roomRegistry[type]!
                        room = new RoomCtor(this.io)
                    }

                    const [success, error] = room!.onAuth(options)
                    if (success) {
                        socket.emit('joinStatus', true)

                        this.roomOfPlayer.set(player, room!)
                        this.rooms.add(room!)
                    } else {
                        socket.emit('joinStatus', false, error)
                        return
                    }
                } else {
                    socket.emit('joinStatus', true)
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
                const room = this.roomOfPlayer.get(player)!
                room.onLeave(player)
                socket.leave(room.roomId)
                this.roomOfPlayer.delete(player)
                if (!this.numOfPlayersIn(room.roomId)) {
                    this.rooms.delete(room)
                    room.onDispose()
                }
            })

            socket.on('carCtrl', (player, ctrl) => {
                const room = this.roomOfPlayer.get(player)!
                room.onCarCtrl(player, ctrl)
            })

            socket.onAny((eventName, player, ...args) => {
                if (['joinRoom', 'leaveRoom', 'carCtrl'].includes(eventName))
                    return
                logger.debug(`Receive "${eventName}" event from ${player}`)
                const room = this.roomOfPlayer.get(player)!
                room._handle(eventName, player, args)
            })

            socket.on('disconnect', (reason) => {
                logger.info(`Client ${socket.id} disconnected: ${reason}`)
            })
        })

        this.startSyncProgress()
    }

    private async hostGame() {
        try {
            const deploy = await createSysDeployReq(
                `@"CarBrawl"!({"host": "${SystemRevAddr}", "cost": ${
                    process.dev ? 100 : 100_000
                }})`,
            )
            await sendDeploy(deploy, () => {
                throw new Error('Send deploy error: check the deploy code')
            })
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

    private numOfPlayersIn(roomId: string) {
        return _.filter(Array.from(this.roomOfPlayer.values()), { roomId })
            .length
    }

    private startSyncProgress() {
        setInterval(() => {
            if (_.isEmpty(this.roomOfPlayer)) return

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
