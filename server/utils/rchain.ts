import { useLogger } from '@nuxt/kit'
import { BinaryWriter } from 'google-protobuf'
import { fetchDeployInfo } from '../rchain/http'
import { signDeploy } from '../rchain/sign'
import { rnodeHttp } from '../rchain/axios'
import { DeployData, DeployInfo, DeployRequest } from '~/models'

const logger = useLogger('Rchain API')

export async function createSysDeployReq(
    code: string,
    validAfterBlockNumber?: number,
): Promise<DeployRequest> {
    let seqNum = validAfterBlockNumber
    seqNum ?? ([{ seqNum }] = (await rnodeHttp.get('/api/blocks/1')).data)
    const deployData: DeployData = {
        term: code,
        phloPrice: 1,
        phloLimit: 1000000,
        timestamp: Date.now(),
        validAfterBlockNumber: seqNum!,
    }
    return signDeploy(deployData)
}

export async function checkDeployStatus(
    deployId: string,
    onError: (errored?: boolean, systemDeployError?: string) => void,
) {
    let deployInfo = await fetchDeployInfo(deployId)
    let attemptsCnt = 1
    if (!deployInfo) {
        deployInfo = await new Promise((resolve, reject) => {
            const FETCH_POLLING = setInterval(async () => {
                const d = await fetchDeployInfo(deployId)
                ++attemptsCnt
                if (d) {
                    clearInterval(FETCH_POLLING)
                    resolve(d)
                } else if (attemptsCnt === 8) {
                    reject(new Error('Fetch deploy info timeout.'))
                }
            }, 7500)
        })
    }
    const { errored, systemDeployError } = deployInfo as DeployInfo
    if (errored || systemDeployError) onError(errored, systemDeployError)
}

export function deployDataProtobufSerialize(deployData: DeployData) {
    const { term, timestamp, phloPrice, phloLimit, validAfterBlockNumber } =
        deployData

    const writer = new BinaryWriter()

    const writeString = (order: number, val: string) =>
        val !== '' && writer.writeString(order, val)
    const writeInt64 = (order: number, val: number) =>
        val !== 0 && writer.writeInt64(order, val)
    /*
        https://github.com/rchain/rchain/blob/40d15bf88d343ea5eea904a6bfc82306ce696615/models/src/main/protobuf/CasperMessage.proto#L133-L147
        message DeployDataProto {
            bytes  deployer     = 1; //public key
            string term         = 2; //rholang source code to deploy (will be parsed into `Par`)
            int64  timestamp    = 3; //millisecond timestamp
            bytes  sig          = 4; //signature of (hash(term) + timestamp) using private key
            string sigAlgorithm = 5; //name of the algorithm used to sign
            int64 phloPrice     = 7; //phlo price
            int64 phloLimit     = 8; //phlo limit for the deployment
            int64 validAfterBlockNumber = 10;
        }
     */

    writeString(2, term)
    writeInt64(3, timestamp)
    writeInt64(7, phloPrice)
    writeInt64(8, phloLimit)
    writeInt64(10, validAfterBlockNumber)

    return writer.getResultBuffer()
}
