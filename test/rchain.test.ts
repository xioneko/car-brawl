import { describe, it, expect } from 'vitest'
import type { DeployRequest } from '~/models'
import { sendDeploy, propose, dataAtName } from '~/server/rchain/http'
import { createSysDeployReq, checkDeployStatus } from '~/server/utils/rchain'

describe('Rnode Client', () => {
    // 前置条件：Rchain 服务正常部署在本地
    it(
        'should successfully deploy and get correct data',
        async () => {
            const echo = (rhoData: string) => `
                new test, deployId(\`rho:rchain:deployId\`) in {
                    test!(${rhoData}, *deployId) |
                    contract test(@msg, return) = {
                        return!(msg)
                    }
                }`
            const req1 = await createSysDeployReq(echo('"Hello world!"'))
            const req2 = await createSysDeployReq(
                echo('{ "a": 1, "b": 2 }'),
                req1.data.validAfterBlockNumber,
            )
            const req3 = await createSysDeployReq(
                echo('(false, 123, [1, 2, 3])'),
                req1.data.validAfterBlockNumber,
            )
            await Promise.all([
                sendDeploy(req1),
                sendDeploy(req2),
                sendDeploy(req3),
            ])

            await propose()

            const fetchData = async (req: DeployRequest) => {
                await checkDeployStatus(
                    req.signature,
                    (errored, systemDeployError) => {
                        throw new Error(`Deploy Error: ${req.data.term}}`)
                    },
                )
                return await dataAtName(req.signature)
            }

            const [res1, res2, res3] = await Promise.all([
                fetchData(req1),
                fetchData(req2),
                fetchData(req3),
            ])

            expect(res1).toEqual('Hello world!')
            expect(res2).toEqual({ a: 1, b: 2 })
            expect(res3).toEqual([false, 123, [1, 2, 3]])
        },
        {
            timeout: 30000,
        },
    )
})
