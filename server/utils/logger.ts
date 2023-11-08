import { useLogger as _useLogger } from '@nuxt/kit'

export function useLogger(tag: string) {
    const logger = _useLogger(tag)
    logger.level = process.dev ? 4 : 3

    return logger
}
