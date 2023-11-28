import { consola } from 'consola'

export function useLogger(tag: string) {
    const logger = consola.withTag(tag)
    logger.level = process.env.VITEST ? 5 : process.dev ? 4 : 3

    return logger
}
