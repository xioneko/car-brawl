import { CompetitiveRoom } from '../socket/rooms'
import { sendDeploy, propose, dataAtName } from '../rchain/http'
import { PostBuyTicket } from '~/models'

const logger = useLogger('BuyTicket Service')

export default defineEventHandler(async (event): Promise<PostBuyTicket.Res> => {
    const {
        deploy: deployData,
        account,
        signature: sigHex,
    } = await readBody<PostBuyTicket.Req>(event)
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
            const accessToken = CompetitiveRoom.createAccessToken(
                account.revAddr,
            )
            return { accessToken }
        }

        return { error: msg ?? 'Buy ticket failed.' }
    } catch (error) {
        logger.debug(error)
        throw error
    }
})
