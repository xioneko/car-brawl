import _ from 'lodash'
import type { Server } from 'socket.io'
import type { CarCtrl, GameState } from '~/models/game'
import { RoomOptions, RoomType, RoomUserData } from '~/models/room'
import {
    ClientEvents,
    EventsMap,
    EventNames,
    ServerEvents,
} from '~/models/events'

const logger = useLogger('Room')

export abstract class Room<
    State extends GameState,
    Listens extends EventsMap<Listens> = ClientEvents,
    Emits extends EventsMap<Emits> = ServerEvents,
> {
    private server: Server<Listens, Emits>

    private messageHandlers: Map<keyof Listens, Listens[keyof Listens]> =
        new Map()

    _modified: boolean = false

    _available: boolean = true

    readonly type: RoomType

    readonly roomId: string

    readonly maxPlayers: number

    readonly userData: Map<string, RoomUserData> = new Map()

    state!: State

    constructor(
        server: Server,
        type: RoomType,
        initState: State,
        maxPlayers: number = Number.POSITIVE_INFINITY,
    ) {
        this.server = server
        this.type = type
        this.state = initState
        this.roomId = Math.random().toString(36).slice(-8)
        this.maxPlayers = maxPlayers
    }

    _handle(event: keyof Listens, player: string, ...args: any[]): void {
        const handler = this.messageHandlers.get(event)
        if (handler) handler(player, ...args)
    }

    requestSync() {
        this._modified = true
        // logger.debug(`Room ${this.roomId} state modified`)
    }

    dispose() {
        this._available = false
    }

    on<T extends Exclude<EventNames<Listens>, EventNames<ClientEvents>>>(
        event: T,
        handler: Listens[T],
    ): void {
        this.messageHandlers.set(event, handler)
    }

    send<T extends Exclude<EventNames<Emits>, EventNames<ServerEvents>>>(
        event: T,
        target: string,
        ...prams: Parameters<Emits[T]>
    ) {
        this.server.to(target).emit(event, ...prams)
    }

    onAuth(
        player: string,
        options: RoomOptions,
    ): [success: boolean, error?: string] {
        return [true]
    }

    abstract onJoin(player: string, options: RoomOptions, rejoin: boolean): void

    abstract onLeave(player: string): void

    abstract onCarCtrl(player: string, ctrl: CarCtrl): void

    abstract onDispose(): void

    abstract nextTick(): void

    abstract onBeforeSync?(): void
}
