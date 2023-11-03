import _ from 'lodash'
import { useLogger } from '@nuxt/kit'
import { PostDeploy, type PostLogin } from '~/models/http'

const logger = useLogger('Login Service')
const SystemRevAddr = process.env.BOOT_REV_ADDRESS!

export default defineEventHandler(async (event): Promise<PostLogin.Res> => {
    const { revAddr } = await readBody<PostLogin.Req>(event)

    const faucetReq = await createSysDeployReq(
        `new deployId(\`rho:rchain:deployId\`), result in {
            @"Faucet"!("${SystemRevAddr}", "${revAddr}", *result) |
            for (@r <- result) {
                deployId!(r)
            }
        }`,
    )
    // logger.debug('Faucet deploy request:', faucetReq)
    const {
        data: [success, msg],
    } = await $fetch<PostDeploy.Res>('/api/deploy', {
        method: 'POST',
        body: <PostDeploy.Req>{
            deployRequest: faucetReq,
        },
    })
    logger.debug('Faucet deploy result:', success, msg)

    const registered = (msg as string).includes('registered')
    return {
        registered,
        error: success || registered ? undefined : msg,
    }
})
