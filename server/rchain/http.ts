import { useLogger } from '@nuxt/kit'
import { rnodeAdmin, rnodeHttp } from './axios'
import { parseRhoExpr } from './parse'
import { DeployInfo, DeployRequest } from '~/models/http'

const logger = useLogger('Rchain API')

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

export async function dataAtName<T>(name: string, depth = 1): Promise<T> {
    const data = (
        await rnodeHttp.post(`/api/data-at-name`, {
            depth,
            name: { UnforgDeploy: { data: name } },
        })
    ).data

    const {
        exprs: [{ expr }],
    } = data

    return parseRhoExpr(expr) as T
}
