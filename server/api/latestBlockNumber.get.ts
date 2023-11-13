import { rnodeHttp } from '../rchain/axios'
import { GetLatestBlockNumber } from '~/models'

export default defineEventHandler(
    async (event): Promise<GetLatestBlockNumber.Res> => {
        const [{ seqNum }] = (await rnodeHttp.get('/api/blocks/1')).data
        return { blockNum: seqNum }
    },
)
