import { createServer } from 'node:http'
import { type AddressInfo } from 'node:net'
import _ from 'lodash'
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import { Server } from 'socket.io'
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client'
import { CarBrawlServer } from '../server/socket/CarBrawlServer'
import {
    RoomOptions,
    RoomType,
    type ClientEvents,
    type ServerEvents,
    type EventsMap,
    type CarCtrl,
} from '../models'
import { RoomClassBuilder } from './utils/builder'

describe('CarBrawlServer', () => {
    let port: number
    let io: Server

    beforeAll(
        () =>
            new Promise((resolve) => {
                const httpServer = createServer()
                io = new Server(httpServer)
                httpServer.listen(() => {
                    port = (httpServer.address() as AddressInfo).port
                    resolve()
                })
            }),
    )

    afterAll(() => {
        io.close()
    })

    describe('Player Join', () => {
        it('should create a new room when existing rooms are full', () => {
            return new Promise<void>((done) => {
                const gameServer = new CarBrawlServer(io, {
                    [RoomType.FunRoom]: new RoomClassBuilder()
                        .withType(RoomType.FunRoom)
                        .withMaxPlayers(2)
                        .build(),
                    [RoomType.SingleRoom]: new RoomClassBuilder()
                        .withType(RoomType.SingleRoom)
                        .build(),
                    [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                        .withType(RoomType.CompetitiveRoom)
                        .build(),
                }).setup()

                const clients = _.times(3, () => {
                    return ioc(`http://localhost:${port}`) as ClientSocket<
                        ServerEvents,
                        ClientEvents
                    >
                })

                clients.forEach((client, index) => {
                    client.on('connect', () => {
                        client.emit(
                            'joinRoom',
                            'player_' + index,
                            RoomType.FunRoom,
                            {} as RoomOptions,
                        )
                    })
                })

                new Promise((resolve) => {
                    let joinCnt = 0
                    clients.forEach((client) => {
                        client.on('joinStatus', (success) => {
                            if (success) joinCnt++
                            else resolve(false)
                            if (joinCnt === 3) resolve(true)
                        })
                    })
                }).then((success) => {
                    expect(success).toBeTruthy()
                    expect(gameServer.rooms.size).toBe(2)

                    gameServer.close()
                    clients.forEach((client) => client.close())
                    done()
                })
            })
        })
    })

    it('should be delegated to the room when the server receives events from clients', () => {
        let client: ClientSocket<ServerEvents, ClientEvents>
        const handlers = {
            carCtrl: vi.fn(),
            joinRoom: vi.fn(),
            leaveRoom: vi.fn(),
            customEvent: vi.fn(),
        }

        return new Promise<void>((done) => {
            const gameServer = new CarBrawlServer(io, {
                [RoomType.FunRoom]: new RoomClassBuilder()
                    .withType(RoomType.FunRoom)
                    .onCarCtrl(handlers.carCtrl)
                    .onJoin(handlers.joinRoom)
                    .onLeave(handlers.leaveRoom)
                    .onCreate((room) => {
                        room.on<any>('custom-event', handlers.customEvent)
                    })
                    .build(),
                [RoomType.SingleRoom]: new RoomClassBuilder()
                    .withType(RoomType.SingleRoom)
                    .build(),
                [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                    .withType(RoomType.CompetitiveRoom)
                    .build(),
            }).setup()

            client = ioc(`http://localhost:${port}`) as ClientSocket<
                ServerEvents,
                ClientEvents
            >

            client.on('connect', () => {
                client.emit(
                    'joinRoom',
                    'player',
                    RoomType.FunRoom,
                    {} as RoomOptions,
                )
            })

            client.on('joinStatus', (success) => {
                expect(success).toBeTruthy()
                expect(handlers.joinRoom).toHaveBeenCalled()

                client.emit('carCtrl', 'player', {} as CarCtrl)
                client.emit('custom-event', 'player')
                client.emit('leaveRoom', 'player')

                setTimeout(() => {
                    expect(handlers.carCtrl).toHaveBeenCalled()
                    expect(handlers.leaveRoom).toHaveBeenCalled()
                    expect(handlers.customEvent).toHaveBeenCalled()
                    gameServer.close()
                    client.close()
                    done()
                }, 500)
            })
        })
    })

    it('should synchronize the modified state to all clients', () => {
        return new Promise<void>((done) => {
            const gameServer = new CarBrawlServer(io, {
                [RoomType.FunRoom]: new RoomClassBuilder()
                    .withType(RoomType.FunRoom)
                    .build(),
                [RoomType.SingleRoom]: new RoomClassBuilder()
                    .withType(RoomType.SingleRoom)
                    .build(),
                [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                    .withType(RoomType.CompetitiveRoom)
                    .build(),
            })
                .setup()
                .startStateSyncLoop()

            const clients = _.times(3, () => {
                return ioc(`http://localhost:${port}`) as ClientSocket<
                    ServerEvents,
                    ClientEvents
                >
            })

            clients.forEach((client, index) => {
                client.on('connect', () => {
                    client.emit(
                        'joinRoom',
                        'player_' + index,
                        RoomType.FunRoom,
                        {} as RoomOptions,
                    )
                })
            })

            new Promise((resolve) => {
                let joinCnt = 0
                clients.forEach((client) => {
                    client.on('joinStatus', (success) => {
                        if (success) joinCnt++
                        else resolve(false)
                        if (joinCnt === 3) resolve(true)
                    })
                })
            }).then((success) => {
                expect(success).toBeTruthy()

                const stateSyncHandler = vi.fn()
                clients.forEach((client) => {
                    client.on('stateSync', stateSyncHandler)
                })

                gameServer.rooms.forEach((room) => {
                    room.requestSync()
                })

                setTimeout(() => {
                    expect(stateSyncHandler).toBeCalledTimes(3)
                    gameServer.close()
                    clients.forEach((client) => client.close())
                    done()
                }, 500)
            })
        })
    })

    describe('Player Disconnection', () => {
        it('should be removed from the room if a client does not reconnect for too long', () => {
            const leaveHandler = vi.fn()
            return new Promise<void>((done) => {
                const gameServer = new CarBrawlServer(io, {
                    [RoomType.FunRoom]: new RoomClassBuilder()
                        .withType(RoomType.FunRoom)
                        .onLeave(leaveHandler)
                        .build(),
                    [RoomType.SingleRoom]: new RoomClassBuilder()
                        .withType(RoomType.SingleRoom)
                        .build(),
                    [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                        .withType(RoomType.CompetitiveRoom)
                        .build(),
                })
                    .setup()
                    .startClearConnectionLoop('20ms', '30ms')

                const client = ioc(`http://localhost:${port}`) as ClientSocket<
                    ServerEvents,
                    ClientEvents
                >

                client.on('connect', () => {
                    client.emit(
                        'joinRoom',
                        'player',
                        RoomType.FunRoom,
                        {} as RoomOptions,
                    )
                })

                client.on('joinStatus', (success) => {
                    expect(success).toBeTruthy()

                    client.disconnect()
                    setTimeout(() => {
                        expect(leaveHandler).toHaveBeenCalled()
                        gameServer.close()
                        client.close()
                        done()
                    }, 500)
                })
            })
        })
    })
})
