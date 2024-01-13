import _ from 'lodash'
import { Server } from 'socket.io'
import { CarBrawlServer } from './socket/CarBrawlServer'
import { CompetitiveRoom, FunRoom, SingleRoom } from './socket/rooms'
import { propose, sendDeploy } from './rchain/http'
import { RoomType } from '~/models/room'

const logger = useLogger('Server')

if (process.dev) {
    // @ts-ignore
    import('#internal/nitro/entries/nitro-dev')
} else {
    // @ts-ignore
    import('#internal/nitro/entries/node-server')
}

const port = parseInt(process.env.SOCKET_PORT!)
const io = new Server(port, {
    cors: {
        origin: `http://${process.dev ? 'localhost' : process.env.SERVER_IP}:${
            process.env.PORT
        }`,
    },
})
const server = new CarBrawlServer(io, {
    [RoomType.FunRoom]: FunRoom,
    [RoomType.CompetitiveRoom]: CompetitiveRoom,
    [RoomType.SingleRoom]: SingleRoom,
})
    .setup()
    .startStateSyncLoop()
    .startClearConnectionLoop()

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
            _.map(deployIds, async (id: string) => {
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
    } catch (error: any) {
        logger.error(`Initialize contracts failed: ${error.message}`)
    }
})()

server.hostGame()
