import { rnodeAdmin, rnodeHttp } from './axios'
import { parseRhoExpr } from './parse'
import { DeployInfo, DeployRequest } from '~/models/protocol'

export function sendDeploy(deployRequest: DeployRequest) {
    return rnodeHttp.post('/api/deploy', deployRequest)
}

export async function propose() {
    await rnodeAdmin.post('/api/propose')
}

export async function fetchDeployInfo(
    deployId: string,
): Promise<DeployInfo | undefined> {
    const { blockHash } = await rnodeHttp
        .get(`/api/deploy/${deployId}`)
        .then((res) => res.data)
        .catch((err) => {
            if (!err.response || err.response.status !== 400) {
                throw err
            }
        })

    if (blockHash) {
        const { deploys }: { deploys: DeployInfo[] } = (
            await rnodeHttp.get(`/api/block/${blockHash}`)
        ).data
        return deploys.find((d) => d.sig === deployId)
    }
}

export async function fetchDeployInfoByPolling(
    deployId: string,
    maxAttempts: number,
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
                } else if (attemptsCnt === maxAttempts) {
                    reject(new Error('Fetch deploy info timeout.'))
                }
            }, 7500)
        })
    }
    return deployInfo as DeployInfo
}

export async function dataAtName<T>(name: string): Promise<T> {
    const {
        exprs: [{ expr }],
    } = (
        await rnodeHttp.post(`/api/data-at-name`, {
            depth: 1,
            name: { UnforgDeploy: { data: name } },
        })
    ).data

    return parseRhoExpr(expr) as T
}
