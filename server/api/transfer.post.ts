import { dataAtName, propose, sendDeploy } from '../rchain/http'
import { PostTransfer } from '~/models'

const logger = useLogger('Transfer Service')

export default defineEventHandler(async (event): Promise<PostTransfer.Res> => {
    const { deploy: deployData, signature: sigHex } =
        await readBody<PostTransfer.Req>(event)

    try {
        const deployRequest = createUsrDeployReq(deployData, sigHex)

        await sendDeploy(deployRequest)

        await propose()

        const deployId = deployRequest.signature
        await checkDeployStatus(deployId, (errored, systemDeployError) => {
            logger.debug('Deploy status:', systemDeployError)
            throw createError({
                statusCode: 400,
                message: 'Do you have enough REV?',
            })
        })

        const [success, msg] = await dataAtName<[boolean?, string?]>(deployId)

        if (success) {
            return {}
        }

        return { error: msg ?? 'Transfer failed.' }
    } catch (error) {
        logger.debug(error)
        throw error
    }
})
