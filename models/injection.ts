import { Socket } from 'socket.io-client'
import { ServerEvents, ClientEvents } from './events'

export const socketKey: InjectionKey<Socket<ServerEvents, ClientEvents>> =
    Symbol('socket')
