import _ from 'lodash'
import { dataAtName, propose, sendDeploy } from '../rchain/http'
import { type PostLogin } from '~/models/http'

const logger = useLogger('Login Service')

const SystemRevAddr = process.env.BOOT_REV_ADDRESS!

export default defineEventHandler(async (event): Promise<PostLogin.Res> => {
    const { revAddr } = await readBody<PostLogin.Req>(event)

    verify(revAddr)

    try {
        const deployRequest = await createSysDeployReq(
            `new deployId(\`rho:rchain:deployId\`), deployer(\`rho:rchain:deployerId\`) in {
                @"Faucet"!(*deployer, "${SystemRevAddr}", "${revAddr}", *deployId)
            }`,
        )

        await sendDeploy(deployRequest)

        await propose()

        const deployId = deployRequest.signature
        await checkDeployStatus(deployId, (errored, systemDeployError) => {
            logger.error(
                'Does the system account has enough REV?',
                systemDeployError,
            )
            throw createError({
                statusCode: 500,
                message: 'Server internal error',
            })
        })
        const [success, msg] = await dataAtName<[boolean, string]>(deployId)

        // logger.debug('Faucet deploy result:', success, msg)

        const registered = (msg as string).includes('registered')
        return {
            registered,
            error: success || registered ? undefined : msg,
        }
    } catch (error) {
        logger.debug('Login Service Response:', error)
        throw error
    }
})

function verify(revAddr: string) {
    // TODO: 验证 revAddr 是否合法
}
