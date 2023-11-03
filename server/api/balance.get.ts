import { useLogger } from '@nuxt/kit'
import { rnodeRead } from '../rchain/axios'
import { GetBalance } from '~/models/http'

const logger = useLogger('Balance Service')

export default defineEventHandler(async (event): Promise<GetBalance.Res> => {
    const { revAddr } = getQuery<GetBalance.Req>(event)

    logger.debug('Check balance of REV address:', revAddr)

    const code = `@"CheckBalance"!("${revAddr}")`
    const {
        // @ts-ignore
        expr: [expr],
    } = (await rnodeRead.post('/api/explore-deploy', code)).data

    const errStr = expr.ExprString?.data as string | undefined
    if (errStr) {
        logger.error('Check balance error:', errStr)
        throw createError({
            statusCode: 400,
            statusMessage: errStr,
        })
    }

    const balance = expr.ExprInt.data as number
    return { amount: balance }
})
