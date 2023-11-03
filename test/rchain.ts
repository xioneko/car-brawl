import { sendDeploy, propose, dataAtName } from '~/server/rchain/http'

const logger = useLogger('Rchain API Test')

;(async function testAnyDeploy() {
    try {
        const deployRequest = await createSysDeployReq(
            `new result, deployId(\`rho:rchain:deployId\`) in {
                @"Test"!(*result) |
                for (@msg <- result) {
                    deployId!(msg)
                }
            }`,
        )
        await sendDeploy(deployRequest)
        await propose()
        await checkDeployStatus(
            deployRequest.signature,
            (errored, systemDeployError) => {
                throw new Error('deploy error')
            },
        )
        const data = await dataAtName(deployRequest.signature)
        logger.info(data)
    } catch (err) {
        logger.error(err)
    }
})()
