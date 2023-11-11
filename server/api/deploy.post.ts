import { logger } from '../rchain/logger'
import {
    dataAtName,
    fetchDeployInfoByPolling,
    propose,
    sendDeploy,
} from '../rchain/http'
import type { PostDeploy } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<PostDeploy.Res> => {
    const { deployRequest, ack } = await readBody<PostDeploy.Req>(event)

    await sendDeploy(deployRequest).catch((err) => {
        const { statusCode, statusMessage } = err.response
        createError({ statusCode, statusMessage })
    })

    await propose()

    const deployId = deployRequest.signature
    const deployInfo = await fetchDeployInfoByPolling(deployId, 8)
    const { errored, systemDeployError } = deployInfo
    if (errored) {
        logger.info('Deploy execution error:', errored)
        throw createError({
            statusCode: 400,
            statusMessage: errored,
        })
    } else if (systemDeployError) {
        throw createError({
            statusCode: 500,
            statusMessage: `${systemDeployError} (rchain system error).`,
        })
    }
    const result = ack ? await dataAtName(ack) : null
    return { data: result }
})
