import { logger } from '../rchain/logger'
import { dataAtName, fetchDeploy, propose, sendDeploy } from '../rchain/http'
import type { PostDeploy } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<PostDeploy.Res> => {
    const { deployRequest, ack } = await readBody<PostDeploy.Req>(event)

    await sendDeploy(deployRequest).catch((err) => {
        const { statusCode, statusMessage } = err.response
        createError({ statusCode, statusMessage })
    })

    await propose()

    let attemptsCnt = 0
    const deployId = deployRequest.signature
    let deployInfo = await fetchDeploy(deployId)
    if (!deployInfo) {
        deployInfo = await new Promise((resolve, reject) => {
            const FETCH_POLLING = setInterval(async () => {
                const d = await fetchDeploy(deployId)
                ++attemptsCnt
                if (d) {
                    clearInterval(FETCH_POLLING)
                    resolve(d)
                } else if (attemptsCnt === 8) {
                    setResponseStatus(event, 500)
                    reject(new Error('Fetch deploy info timeout.'))
                }
            }, 7500)
        })
    }
    const { errored, systemDeployError } = deployInfo!
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
