import { useLogger } from '@nuxt/kit'
import _ from 'lodash'
import { ObservableMap, ObservableSet } from '../utils/observable'
import type { CarCtrl } from '~/models/game'
import { RoomOptions, RoomType, RoomUserData } from '~/models/room'

const logger = useLogger('Room')

export abstract class Room<
    State extends object,
    Events extends { [ev: string]: any } = {},
> {
    private messageHandlers: Map<keyof Events, Events[keyof Events]> = new Map()

    _modified: boolean = false

    type: RoomType

    readonly roomId: string

    readonly maxPlayers: number

    readonly userData: Map<string, RoomUserData> = new Map()

    /**
     * Observable State
     *
     * 注意：只有通过原生方法对 Map 或 Set 的修改才能被检测到
     */
    state!: State

    constructor(
        type: RoomType,
        initState: State,
        maxPlayers: number = Number.POSITIVE_INFINITY,
    ) {
        this.type = type
        this.state = observable(initState, () => {
            this._modified = true
            logger.debug(`Room ${this.roomId} state modified`)
        })
        this.roomId = Math.random().toString(36).slice(-8)
        this.maxPlayers = maxPlayers
    }

    _handle(event: keyof Events, ...args: any[]): void {
        const handler = this.messageHandlers.get(event)
        if (handler) handler(args)
    }

    requestSync() {
        this._modified = true
    }

    on(event: keyof Events, handler: Events[keyof Events]): void {
        this.messageHandlers.set(event, handler)
    }

    onAuth(options: RoomOptions): [success: boolean, error?: string] {
        return [true]
    }

    abstract onJoin(clientId: string, options: RoomOptions): void

    abstract onLeave(clientId: string): void

    abstract onCarCtrl(clientId: string, ctrl: CarCtrl): void

    abstract onDispose(): void

    abstract onBeforeSync?(): void

    abstract nextTick(): void
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
