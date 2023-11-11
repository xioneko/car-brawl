import _ from 'lodash'
import { io, Socket } from 'socket.io-client'

import type { ServerEvents, ClientEvents } from '~/models/events'

const logger = useLogger('Socket')

export const useSocket = () => {
    const toast = useToast()
    const rtConf = useRuntimeConfig()
    const socket: Socket<ServerEvents, ClientEvents> = io(
        `:${rtConf.public.socketPort}`,
    )
    socket.on('connect', () => {
        logger.debug('Connected')
    })

    socket.on('connect_error', (err) => {
        logger.debug(err.message)
    })

    socket.on('disconnect', (reason) => {
        logger.debug(reason)
        if (reason.includes('transport error')) {
            toast.error('Connection lost, please refresh the page.')
        }
    })

    onUnmounted(() => {
        socket.off('connect')
        socket.off('connect_error')
        socket.off('disconnect')
    })

    return socket
}
