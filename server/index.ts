import fs from 'node:fs'
import _ from 'lodash'
import { resolvePath, useLogger } from '@nuxt/kit'
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

;(async function initRchainContracts() {
    Promise.all(
        _.map(
            fs.readdirSync(await resolvePath('contracts')),
            async (rhoFile) => {
                const contract = fs.readFileSync(
                    await resolvePath(`contracts/${rhoFile}`),
                    'utf-8',
                )
                const deployRequest = await createSysDeployReq(contract)
                await sendDeploy(deployRequest)
                logger.success(`Deployed ${rhoFile}`)
                return deployRequest.signature
            },
        ),
    )
        .then(async (deployIds) => {
            await propose()
            return Promise.all(
                _.map(deployIds, async (id) => {
                    await checkDeployStatus(
                        id,
                        (errored, systemDeployError) => {
                            if (errored || systemDeployError)
                                throw new Error(
                                    errored
                                        ? 'Deploy Execution Error'
                                        : `${systemDeployError} (rchain system error).`,
                                )
                        },
                    )
                }),
            )
        })
        .then(() => {
            logger.success('Propose success!')
        })
        .catch((err) => {
            logger.error(err)
        })
})()
