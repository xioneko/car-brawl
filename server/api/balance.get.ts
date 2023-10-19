import { rnodeRead } from '../rchain/axios'
import { logger } from '../rchain/logger'
import { GetBalance } from '~/models/protocol'

export default defineEventHandler(async (event): Promise<GetBalance.Res> => {
    const { revAddr } = getQuery<GetBalance.Req>(event)

    logger.debug('Check balance of REV address:', revAddr)

    const contract = checkBalanceRho(revAddr)
    const {
        // @ts-ignore
        expr: [expr],
    } = (await rnodeRead.post('/api/explore-deploy', contract)).data

    const errStr = expr.ExprString?.data as string | undefined
    if (errStr) {
        throw createError({
            statusCode: 400,
            statusMessage: errStr,
        })
    }

    const balance = expr.ExprInt.data as number
    return { amount: balance }
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
