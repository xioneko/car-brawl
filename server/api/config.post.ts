import _ from 'lodash'
import { getAllConfigs, upsertConfig } from '../database/user-config'
import { UserConfig } from '~/models/config'
import { PostConfig } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<PostConfig.Res> => {
    const { id, config } = await getQuery<PostConfig.Req>(event)
    try {
        await verify(config)
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

async function verify(config: UserConfig) {
    const { name } = config
    const configs = await getAllConfigs()
    const isNameAvailable = _.chain(configs)
        .map((pair) => _.last(pair))
        .map(_.iteratee(['name']))
        .find(name)
        .value()
    if (!isNameAvailable) {
        throw new Error(`Name ${name} has been used.`)
    }
}
