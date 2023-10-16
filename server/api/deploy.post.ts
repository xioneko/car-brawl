import { http, httpAdmin } from '../rchain/http'
import { rhExprToJson } from '../rchain/rho'
import { signDeploy, signMetamask } from '../rchain/sign'
import {
    Deploy,
    DeployData,
    DeployInfo,
    DeployRequest,
    DeployResponse,
} from '../types'
import { logger } from '../rchain/logger'

export default defineEventHandler(async (event) => {
    const { account, code } = await readBody<DeployRequest>(event)

    const deployReq = await sendDeploy(account, code)

    await propose()

    let attemptsCnt = 0
    let deployInfo = await fetchDeploy(deployReq.signature)
    if (!deployInfo) {
        deployInfo = await new Promise((resolve, reject) => {
            const FETCH_POLLING = setInterval(async () => {
                const d = await fetchDeploy(deployReq.signature)
                ++attemptsCnt
                if (d) {
                    clearInterval(FETCH_POLLING)
                    resolve(d)
                } else if (attemptsCnt === 8) {
                    setResponseStatus(event, 500)
                    reject(new Error('Fetch Deploy Info timeout.'))
                }
            }, 7500)
        })
    }
    const { errored, systemDeployError } = deployInfo!
    if (errored) {
        logger.info('Deploy execution error:', errored)
        return createError({
            statusCode: 400,
            statusMessage: errored,
        })
    } else if (systemDeployError) {
        return createError({
            statusCode: 500,
            statusMessage: `${systemDeployError} (system error).`,
        })
    }

    const result = await dataAtName(deployReq.signature)

    return <DeployResponse>{ data: result }
})

async function sendDeploy(account: RevAccount, code: string): Promise<Deploy> {
    const [{ blockNum }] = (await http.get('/api/blocks/1')).data

    const deployData: DeployData = {
        term: code,
        timestamp: Date.now(),
        phloPrice: 1,
        phloLimit: 10000000,
        validAfterBlockNumber: blockNum,
    }

    const deploy =
        'ethAddr' in account
            ? await signMetamask(deployData, account.ethAddr)
            : signDeploy(deployData, account.privKey!)

    return (await http.post('/api/deploy', JSON.stringify(deploy))).data
}

async function propose() {
    await httpAdmin.post('/api/propose')
}

async function fetchDeploy(deployId: string): Promise<DeployInfo | undefined> {
    const { blockHash } = await http
        .get(`/api/deploy/${deployId}`)
        .then((res) => res.data)
        .catch((err) => {
            if (!err.response || err.response.status !== 400) {
                throw err
            }
        })

    if (blockHash) {
        const { deploys }: { deploys: DeployInfo[] } = (
            await http.get(`/api/block/${blockHash}`)
        ).data
        return deploys.find((d) => d.sig === deployId)
    }
}

async function dataAtName(deployId: string): Promise<any[]> {
    const args = {
        depth: 1,
        name: { UnforgDeploy: { data: deployId } },
    }
    const {
        exprs: [{ expr }],
    } = (await http.post(`/api/data-at-name`, JSON.stringify(args))).data

    return rhExprToJson(expr)
}
