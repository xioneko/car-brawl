import _ from 'lodash'
import type { Server } from 'socket.io'
import { ObservableMap, ObservableSet } from '../utils/observable'
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
        // TODO: 是否没必要使用 observable 函数
        // this.state = observable(initState, () => {
        //     this._modified = true
        //     // logger.debug(`Room ${this.roomId} state modified`)
        // })
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

    onAuth(options: RoomOptions): [success: boolean, error?: string] {
        return [true]
    }

    abstract onJoin(player: string, options: RoomOptions, rejoin: boolean): void

    abstract onLeave(clientId: string): void

    abstract onCarCtrl(player: string, ctrl: CarCtrl): void

    abstract onDispose(): void

    abstract nextTick(): void

    abstract onBeforeSync?(): void
}

function observable<T extends object>(target: T, onChange: () => void) {
    const wrapper: any = {}
    const wrap = (val: Map<any, any> | Set<any>) => {
        switch (true) {
            case val instanceof Map:
                return new ObservableMap(onChange, val)
            case val instanceof Set:
                return new ObservableSet(onChange, val)
        }
    }

    const handler: ProxyHandler<T> = {
        get(target: any, key: string | symbol, receiver: any): any {
            const val = target[key]
            if (_.isObject(val)) {
                if (_.isMap(val) || _.isSet(val)) {
                    return wrapper[key] ?? (wrapper[key] = wrap(val))
                }
                return new Proxy(val, handler)
            } else {
                let val = Reflect.get(target, key, receiver)
                if (typeof val === 'function') {
                    val = val.bind(target)
                }
                return val
            }
        },
        set(target: any, key: string | symbol, value: any, receiver: any) {
            const success = Reflect.set(target, key, value, receiver)
            if (success) {
                onChange()
            }
            return success
        },
        deleteProperty(target: any, property: string | symbol) {
            const success = Reflect.deleteProperty(target, property)
            if (success) {
                onChange()
            }
            return success
        },
    }

    return new Proxy<T>(target, handler)
}
