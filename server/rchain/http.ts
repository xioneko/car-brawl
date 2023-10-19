import { rnodeAdmin, rnodeHttp } from './axios'
import { rhExprToJson } from './rho'
import { DeployInfo, DeployRequest } from '~/models/protocol'

export function sendDeploy(deployRequest: DeployRequest) {
    return rnodeHttp.post('/api/deploy', deployRequest)
}

export async function propose() {
    await rnodeAdmin.post('/api/propose')
}

export async function fetchDeploy(
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

export async function dataAtName(deployId: string): Promise<any[]> {
    const {
        exprs: [{ expr }],
    } = (
        await rnodeHttp.post(`/api/data-at-name`, {
            depth: 1,
            name: { UnforgDeploy: { data: deployId } },
        })
    ).data

    return rhExprToJson(expr)
}
