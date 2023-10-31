import { rnodeHttp } from '../rchain/axios'
import { GetLatestBlockNumber } from '~/models/protocol'

export default defineEventHandler(
    async (event): Promise<GetLatestBlockNumber.Res> => {
        const [{ blockNum }] = (await rnodeHttp.get('/api/blocks/1')).data
        return { blockNum }
    },
)
