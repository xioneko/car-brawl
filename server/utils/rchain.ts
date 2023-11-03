import { useLogger } from '@nuxt/kit'
import { fetchDeployInfo } from '../rchain/http'
import { signDeploy } from '../rchain/sign'
import { rnodeHttp } from '../rchain/axios'
import { DeployData, DeployInfo, DeployRequest } from '~/models'

const logger = useLogger('Rchain API')

export async function createSysDeployReq(code: string): Promise<DeployRequest> {
    const [{ seqNum: blockNum }] = (await rnodeHttp.get('/api/blocks/1')).data
    const deployData: DeployData = {
        term: code,
        phloPrice: 1,
        phloLimit: 1000000,
        timestamp: Date.now(),
        validAfterBlockNumber: blockNum,
    }
    return signDeploy(deployData)
}

export async function checkDeployStatus(
    deployId: string,
    onError: (errored?: boolean, systemDeployError?: string) => void,
) {
    let deployInfo = await fetchDeployInfo(deployId)
    let attemptsCnt = 1
    if (!deployInfo) {
        deployInfo = await new Promise((resolve, reject) => {
            const FETCH_POLLING = setInterval(async () => {
                const d = await fetchDeployInfo(deployId)
                ++attemptsCnt
                if (d) {
                    clearInterval(FETCH_POLLING)
                    resolve(d)
                } else if (attemptsCnt === 8) {
                    reject(new Error('Fetch deploy info timeout.'))
                }
            }, 7500)
        })
    }
    const { errored, systemDeployError } = deployInfo as DeployInfo
    if (errored || systemDeployError) onError(errored, systemDeployError)
}
