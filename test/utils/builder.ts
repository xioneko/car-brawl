import type { Server } from 'socket.io'
import { GameState, RoomOptions, RoomType, type CarCtrl } from '~/models'
import { Room } from '~/server/socket/Room'

export class RoomClassBuilder {
    private type: RoomType = RoomType.SingleRoom

    private state: GameState = new GameState()

    private maxPlayers: number | undefined

    private hooks = {
        onCreate: () => {},
        onDispose: () => {},
        onAuth: (player: string, options: RoomOptions) =>
            [true] as [boolean, string?],
        onJoin: (player: string, options: RoomOptions, rejoin: boolean) => {},
        onLeave: (player: string) => {},
        onCarCtrl: (player: string, ctrl: CarCtrl) => {},
        nextTick: () => {},
    }

    build() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const builder = this
        return class room extends Room<GameState> {
            constructor(server: Server) {
                super(server, builder.type, builder.state, builder.maxPlayers)
                builder.hooks.onCreate()
            }

            onAuth = builder.hooks.onAuth
            onJoin = builder.hooks.onJoin
            onLeave = builder.hooks.onLeave
            onCarCtrl = builder.hooks.onCarCtrl
            nextTick = builder.hooks.nextTick
            onDispose = builder.hooks.onDispose
        }
    }

    withType(type: RoomType) {
        this.type = type
        return this
    }

    withInitState(state: GameState) {
        this.state = state
        return this
    }

    withMaxPlayers(num: number) {
        this.maxPlayers = num
        return this
    }

    onCreate(cb: () => void) {
        this.hooks.onCreate = cb
        return this
    }

    onDispose(cb: () => void) {
        this.hooks.onDispose = cb
        return this
    }

    onAuth(cb: (typeof this.hooks)['onAuth']) {
        this.hooks.onAuth = cb
        return this
    }

    onJoin(cb: (typeof this.hooks)['onJoin']) {
        this.hooks.onJoin = cb
        return this
    }

    onLeave(cb: (typeof this.hooks)['onLeave']) {
        this.hooks.onLeave = cb
        return this
    }

    onCarCtrl(cb: (typeof this.hooks)['onCarCtrl']) {
        this.hooks.onCarCtrl = cb
        return this
    }

    nextTick(cb: (typeof this.hooks)['nextTick']) {
        this.hooks.nextTick = cb
        return this
    }
}
