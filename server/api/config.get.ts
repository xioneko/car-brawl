import { getConfigById } from '../database/user-config'
import { GetConfig } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<GetConfig.Res> => {
    try {
        const { id } = getQuery<GetConfig.Req>(event)
        const config = await getConfigById(id)
        return { config: config ?? null }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Query config failed (server error).',
        })
    }
})
