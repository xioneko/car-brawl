import _ from 'lodash'
import { useLogger } from '@nuxt/kit'
import { rnodeAdmin, rnodeHttp } from './axios'
import { parseRhoExpr } from './parse'

import { DeployInfo, DeployRequest } from '~/models/http'

const logger = useLogger('Rchain HTTP')

export const SystemRevAddr = process.env.BOOT_REV_ADDRESS!

export async function sendDeploy(deployRequest: DeployRequest) {
    try {
        const res = await rnodeHttp.post('/api/deploy', deployRequest)
        return res
    } catch (error: any) {
        throw new Error(
            `Send deploy Error: ${error.response?.data}.\nDeploy ${_.truncate(
                deployRequest.data.term,
                {
                    separator: ' ',
                    length: 24,
                },
            )}`,
        )
    }
}

export async function propose() {
    try {
        await rnodeAdmin.post('/api/propose')
    } catch (error: any) {
        logger.warn('Propose failed:', error.response?.data)
    }
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
            return {}
        })

    if (blockHash) {
        const { deploys }: { deploys: DeployInfo[] } = (
            await rnodeHttp.get(`/api/block/${blockHash}`)
        ).data
        return deploys.find((d) => d.sig === deployId)
    }
}

export async function dataAtName<T>(name: string, depth = 1): Promise<T> {
    const { exprs } = (
        await rnodeHttp.post(`/api/data-at-name`, {
            depth,
            name: { UnforgDeploy: { data: name } },
        })
    ).data
    const expr = exprs[0]?.expr

    return parseRhoExpr(expr) as T
}
