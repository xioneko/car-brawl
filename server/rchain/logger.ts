import { useLogger } from '@nuxt/kit'

export const logger = useLogger('Rchain Service')

if (process.env.dev) {
    logger.level = 4 // debug
}
