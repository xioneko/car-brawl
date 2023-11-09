import _ from 'lodash'
import { CarBrawlServer } from './socket/CarBrawlServer'
import { CompetitiveRoom, FunRoom, SingleRoom } from './socket/rooms'
import { propose, sendDeploy } from './rchain/http'
import { RoomType } from '~/models/room'

const logger = useLogger('Server')

if (process.dev) {
    // @ts-expect-error
    import('#internal/nitro/entries/nitro-dev')
} else {
    // @ts-expect-error
    import('#internal/nitro/entries/node-server')
}

const port = parseInt(process.env.SOCKET_PORT!)

const server = new CarBrawlServer(port, {
    [RoomType.FunRoom]: FunRoom,
    [RoomType.CompetitiveRoom]: CompetitiveRoom,
    [RoomType.SingleRoom]: SingleRoom,
})
server.hostGame()
;(async function initRchainContracts() {
    const storage = useStorage()
    const rhoAssets = await storage.getKeys('assets/contracts')

    try {
        const deployIds = await Promise.all(
            _.map(
                await storage.getItems(rhoAssets),
                async ({ key: rhoAsset, value: contract }) => {
                    const deployRequest = await createSysDeployReq(
                        contract!.toString(),
                    )
                    await sendDeploy(deployRequest)

                    logger.success(`Deployed ${rhoAsset.split(':').at(-1)}`)
                    return deployRequest.signature
                },
            ),
        )

        await propose()

        await Promise.all(
            _.map(deployIds, async (id) => {
                await checkDeployStatus(id, (errored, systemDeployError) => {
                    if (errored || systemDeployError)
                        throw new Error(
                            `Deploy failed: ${
                                systemDeployError ?? 'check rnode logs'
                            }`,
                        )
                })
            }),
        )

        logger.success('Propose success!')
    } catch {}
})()
