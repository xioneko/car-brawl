import { sendDeploy } from '../rchain/http'
import type { DeployData, DeployRequest, PostFaucet } from '~/models/protocol'

const SystemRevAddr = parseInt(process.env.BOOT_REV_ADDRESS!)

export default defineEventHandler(async (event) => {
    const { revAddr } = await readBody<PostFaucet.Req>(event)

    const deployData: DeployData = {
        term: faucetRho(revAddr),
        phloPrice: 1,
        phloLimit: 100000,
        timestamp: Date.now(),
        validAfterBlockNumber: await $fetch('/api/latestBlockNumber'),
    }

    await sendDeploy(deployRequest)
})

const faucetRho = (addr: string) => `

`
