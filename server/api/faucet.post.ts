import _ from 'lodash'
import {
    dataAtName,
    fetchDeployInfoByPolling,
    propose,
    sendDeploy,
} from '../rchain/http'
import { logger } from '../rchain/logger'
import { signDeploy } from '../rchain/sign'
import type { DeployData, PostFaucet } from '~/models/http'

const SystemRevAddr = process.env.BOOT_REV_ADDRESS!

export default defineEventHandler(async (event): Promise<PostFaucet.Res> => {
    const { revAddr } = await readBody<PostFaucet.Req>(event)

    const ack = _.times(64, () =>
        ((Math.random() * 0xf) << 0).toString(16),
    ).join('')
    const deployData: DeployData = {
        term: `@"Faucet"!("${SystemRevAddr}", "${revAddr}", "${ack}")`,
        phloPrice: 1,
        phloLimit: 100000,
        timestamp: Date.now(),
        validAfterBlockNumber: await $fetch('/api/latestBlockNumber'),
    }

    const deployRequest = signDeploy(deployData)

    await sendDeploy(deployRequest)
    await propose()

    const deployId = deployRequest.signature
    const deployInfo = await fetchDeployInfoByPolling(deployId, 8)
    const { errored, systemDeployError } = deployInfo
    if (errored) {
        logger.error('Deploy execution error:', errored)
        throw createError({
            statusCode: 400,
            statusMessage: errored,
        })
    } else if (systemDeployError) {
        logger.error('System Deploy Error:', systemDeployError)
        throw createError({
            statusCode: 500,
            statusMessage: `${systemDeployError} (rchain system error).`,
        })
    }

    const [success, msg] = await dataAtName<[boolean, string]>(ack)
    logger.info(msg)
    return { error: success ? undefined : msg }
})
