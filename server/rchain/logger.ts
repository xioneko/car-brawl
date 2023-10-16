import { useLogger } from '@nuxt/kit'

export const logger = useLogger('Rchain Service')

if (process.env.NODE_ENV === 'development') {
    logger.level = 4 // debug
}
