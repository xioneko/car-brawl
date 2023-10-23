import _ from 'lodash'
import { upsertConfig } from '../database/userConfig'
import { PostConfig } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<PostConfig.Res> => {
    const { id, config } = await getQuery<PostConfig.Req>(event)
    try {
        // await verify(config)
        await upsertConfig(id, config)
        return {}
    } catch (err) {
        if (err instanceof ValidationError) {
            return { error: err.message }
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Update config failed (server error).',
        })
    }
})
