import _ from 'lodash'
import { io, Socket } from 'socket.io-client'
// @ts-ignore
import * as Toast from 'vue-toastification/dist/index.mjs'
import type { ServerEvents, ClientEvents } from '~/models/events'

const logger = useLogger('Socket')

export const useSocket = () => {
    const toast = Toast.useToast()
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
