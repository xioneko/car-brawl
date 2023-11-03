import { useLogger } from '@nuxt/kit'
import { dataAtName, propose, sendDeploy } from '../rchain/http'
import type { PostDeploy } from '~/models/http'

const logger = useLogger('Deploy Service')

export default defineEventHandler(async (event): Promise<PostDeploy.Res> => {
    const { deployRequest } = await readBody<PostDeploy.Req>(event)
    try {
        await sendDeploy(deployRequest)
        await propose()

        const deployId = deployRequest.signature
        await checkDeployStatus(deployId, (errored, systemDeployError) => {
            if (errored) {
                throw createError({
                    statusCode: 400,
                    message: 'Deploy execution error',
                })
            } else if (systemDeployError) {
                throw createError({
                    statusCode: 500,
                    message: `${systemDeployError} (rchain system error).`,
                })
            }
        })
        const result = await dataAtName(deployId)
        return { data: result }
    } catch (error) {
        logger.debug(error)
        throw error
    }
})
