import { consola } from 'consola'
import _ from 'lodash'
import { io, Socket } from 'socket.io-client'
import type { ServerEvents, ClientEvents } from '~/models/events'

const logger = consola.withTag('Socket')
logger.level = process.dev ? 4 : 3

export const useSocket = () => {
    const rtConf = useRuntimeConfig()
    const socket: Socket<ServerEvents, ClientEvents> = io(
        `:${rtConf.public.wsPort}`,
    )
    socket.on('connect', () => {
        logger.debug('Connected')
    })

    socket.on('connect_error', (err) => {
        logger.error(err.message)
    })

    socket.on('disconnect', (reason) => {
        logger.debug(reason)
    })

    return socket
}
