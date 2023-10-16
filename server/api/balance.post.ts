import { useLogger } from '@nuxt/kit'
import { httpReadonly } from '../rchain/http'
import { BalanceRequest, BalanceResponse } from '../types'
import { logger } from '../rchain/logger'

export default defineEventHandler(async (event) => {
    const { revAddress }: BalanceRequest = JSON.parse(await readBody(event))

    logger.debug('Check balance of REV address:', revAddress)

    const contract = checkBalanceRho(revAddress)
    const {
        // @ts-ignore
        expr: [expr],
    } = (await httpReadonly.post('/api/explore-deploy', contract)).data

    const errStr = expr?.ExprString?.data as string | undefined
    if (errStr) {
        throw createError({
            statusCode: 400,
            statusMessage: errStr,
        })
    }

    const balance = expr?.ExprInt?.data as number | undefined
    return <BalanceResponse>{ amount: balance }
})

const checkBalanceRho = (addr: string) => `
  new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    for (@(_, RevVault) <- RevVaultCh) {
      @RevVault!("findOrCreate", "${addr}", *vaultCh) |
      for (@maybeVault <- vaultCh) {
        match maybeVault {
          (true, vault) => @vault!("balance", *return)
          (false, err)  => return!(err)
        }
      }
    }
  }
`
