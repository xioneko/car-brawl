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

        it('should not be able to enter when room is not available', async () => {
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

            // 让第一个玩家尝试加入，创建一个房间
            await new Promise<void>((resolve) => {
                clients[0].on('joinStatus', (success) => {
                    resolve()
                })

                clients[0].emit(
                    'joinRoom',
                    'player_0',
                    RoomType.FunRoom,
                    {} as RoomOptions,
                )
            })

            // 让所有房间不可用
            gameServer.rooms.forEach((room) => room.dispose())

            // 让其他两个玩家尝试加入
            const joinResults = await Promise.all(
                clients.slice(1).map((client, index) => {
                    return new Promise<boolean>((resolve) => {
                        client.on('joinStatus', (success) => {
                            // Check if the player successfully joined
                            resolve(success)
                        })

                        client.emit(
                            'joinRoom',
                            'player_' + (index + 1),
                            RoomType.FunRoom,
                            {} as RoomOptions,
                        )
                    })
                }),
            )

            // Expect that new room have been created
            const Roomnum = Array.from(gameServer.rooms).length
            expect(Roomnum).toBe(2)
            // Close the GameServer and clients
            gameServer.close()
            clients.forEach((client) => client.close())
        })

        it('should enter the room which was chosen', async () => {
            let a = 0
            const gameServer = new CarBrawlServer(io, {
                [RoomType.FunRoom]: new RoomClassBuilder()
                    .withType(RoomType.FunRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_1') {
                            // 玩家成功加入了 FunRoom
                            a = a + 1
                        }
                    })
                    .build(),
                [RoomType.SingleRoom]: new RoomClassBuilder()
                    .withType(RoomType.SingleRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_2') {
                            // 玩家成功加入了 SingleRoom
                            a = a + 1
                        }
                    })
                    .build(),
                [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                    .withType(RoomType.CompetitiveRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_3') {
                            // 玩家成功加入了 CompetitiveRoom
                            a = a + 1
                        }
                    })
                    .build(),
            }).setup()

            const clients = _.times(3, () => {
                return ioc(`http://localhost:${port}`) as ClientSocket<
                    ServerEvents,
                    ClientEvents
                >
            })

            // 让第一个玩家尝试加入，创建一个房间
            await new Promise<void>((resolve) => {
                clients[0].on('joinStatus', (success) => {
                    resolve()
                })

                clients[0].emit(
                    'joinRoom',
                    'player_1',
                    RoomType.FunRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise<void>((resolve) => {
                clients[1].on('joinStatus', (success) => {
                    resolve()
                })

                clients[1].emit(
                    'joinRoom',
                    'player_2',
                    RoomType.SingleRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise<void>((resolve) => {
                clients[2].on('joinStatus', (success) => {
                    resolve()
                })

                clients[2].emit(
                    'joinRoom',
                    'player_3',
                    RoomType.CompetitiveRoom,
                    {} as RoomOptions,
                )
            })
            expect(a).toBe(3)
            gameServer.close()
            clients.forEach((client) => client.close())
        })

        it('should not enter the room when authentication failed', async () => {
            let a = false
            const gameServer = new CarBrawlServer(io, {
                [RoomType.FunRoom]: new RoomClassBuilder()
                    .withType(RoomType.FunRoom)
                    .onAuth(() => {
                        // 模拟验证失败的情况
                        return [false]
                    })
                    .build(),
                [RoomType.SingleRoom]: new RoomClassBuilder()
                    .withType(RoomType.SingleRoom)
                    .onAuth(() => {
                        // 模拟验证失败的情况
                        return [false]
                    })
                    .build(),
                [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                    .withType(RoomType.CompetitiveRoom)
                    .onAuth(() => {
                        // 模拟验证失败的情况
                        return [false]
                    })
                    .build(),
            }).setup()

            const clients = _.times(3, () => {
                return ioc(`http://localhost:${port}`) as ClientSocket<
                    ServerEvents,
                    ClientEvents
                >
            })

            // 让第一个玩家尝试加入，创建一个房间
            await new Promise<void>((resolve) => {
                clients[0].on('joinStatus', (success) => {
                    a = success
                    resolve()
                })

                clients[0].emit(
                    'joinRoom',
                    'player_1',
                    RoomType.FunRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise<void>((resolve) => {
                clients[1].on('joinStatus', (success) => {
                    a = success
                    resolve()
                })

                clients[1].emit(
                    'joinRoom',
                    'player_2',
                    RoomType.SingleRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise<void>((resolve) => {
                clients[2].on('joinStatus', (success) => {
                    a = success
                    resolve()
                })

                clients[2].emit(
                    'joinRoom',
                    'player_3',
                    RoomType.CompetitiveRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise((resolve) => setImmediate(resolve))
            expect(a).toBe(false)
            gameServer.close()
            clients.forEach((client) => client.close())
        })

        it('should leave the current room when join other rooms', async () => {
            let a = 0
            let b = 0
            const gameServer = new CarBrawlServer(io, {
                [RoomType.FunRoom]: new RoomClassBuilder()
                    .withType(RoomType.FunRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_1') {
                            // 玩家成功加入了 FunRoom
                            a = a + 1
                        }
                    })
                    .onLeave((player) => {
                        if (player === 'player_1') {
                            b = b + 1
                        }
                    })
                    .build(),
                [RoomType.SingleRoom]: new RoomClassBuilder()
                    .withType(RoomType.SingleRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_1') {
                            // 玩家成功加入了 SingleRoom
                            a = a + 1
                        }
                    })
                    .onLeave((player) => {
                        if (player === 'player_1') {
                            b = b + 1
                        }
                    })
                    .build(),
                [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                    .withType(RoomType.CompetitiveRoom)
                    .onJoin((player) => {
                        // 在这里判断加入的玩家是谁
                        if (player === 'player_1') {
                            // 玩家成功加入了 CompetitiveRoom
                            a = a + 1
                        }
                    })
                    .onLeave((player) => {
                        if (player === 'player_1') {
                            b = b + 1
                        }
                    })
                    .build(),
            }).setup()

            const client = ioc(`http://localhost:${port}`) as ClientSocket<
                ServerEvents,
                ClientEvents
            >

            // 让第一个玩家尝试加入，创建一个房间
            await new Promise<void>((resolve) => {
                client.on('joinStatus', (success) => {
                    resolve()
                })

                client.emit(
                    'joinRoom',
                    'player_1',
                    RoomType.FunRoom,
                    {} as RoomOptions,
                )
            })

            await new Promise<void>((resolve) => {
                client.on('joinStatus', (success) => {
                    resolve()
                })

                client.emit(
                    'joinRoom',
                    'player_1',
                    RoomType.SingleRoom,
                    {} as RoomOptions,
                )
            })
            try {
                expect(a).toBe(2)
                expect(b).toBe(1)
            } finally {
                gameServer.close()
                client.close()
            }
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

        it('should stay in the original room when a client rejoins after a temporary disconnection', () => {
            const rejoinHandler = vi.fn()
            return new Promise<void>((done) => {
                const gameServer = new CarBrawlServer(io, {
                    [RoomType.FunRoom]: new RoomClassBuilder()
                        .withType(RoomType.FunRoom)
                        .onJoin((player, _, rejoin) => {
                            if (rejoin) rejoinHandler()
                        })
                        .build(),
                    [RoomType.SingleRoom]: new RoomClassBuilder()
                        .withType(RoomType.SingleRoom)
                        .build(),
                    [RoomType.CompetitiveRoom]: new RoomClassBuilder()
                        .withType(RoomType.CompetitiveRoom)
                        .build(),
                })
                    .setup()
                    .startClearConnectionLoop('20ms', '1s')

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
                        client.connect()
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
                            expect(rejoinHandler).toHaveBeenCalled()

                            gameServer.close()
                            client.close()
                            done()
                        })
                    }, 10)
                })
            })
        })
    })
})
