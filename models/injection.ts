import { Socket } from 'socket.io-client'
import type { ServerEvents, ClientEvents } from './events'

export const socketKey: InjectionKey<Socket<ServerEvents, ClientEvents>> =
    Symbol('socket')
