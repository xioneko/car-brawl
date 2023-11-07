import _ from 'lodash'
import { BinaryWriter } from 'google-protobuf'
import type { DeployData, GetLatestBlockNumber } from '~/models/http'
import type { RevAccount } from '~/models/account'

export async function createDeploy(account: RevAccount, code: string) {
    const { blockNum } = await $fetch<GetLatestBlockNumber.Res>(
        '/api/latestBlockNumber',
    )

    const deployData: DeployData = {
        term: code,
        timestamp: Date.now(),
        phloPrice: 1,
        phloLimit: 200000, // TODO 根据实际情况选择更合适的值
        validAfterBlockNumber: blockNum,
    }
    if (!('ethAddr' in account)) throw new Error('Assertion Failed')
    const signature = await signMetamask(deployData, account.ethAddr)

    return { deploy: deployData, signature }
}

async function signMetamask(
    deployData: DeployData,
    ethAddr: string,
): Promise<string> {
    const data = deployDataProtobufSerialize(deployData)
    // @ts-ignore
    const sigHex = await window.ethereum.request({
        method: 'personal_sign',
        params: [bytesToHex(data), ethAddr],
    })

    return sigHex
}

function deployDataProtobufSerialize(deployData: DeployData) {
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

const hexByByte = Array.from({ length: 256 }, (v, i) =>
    i.toString(16).padStart(2, '0'),
)
function bytesToHex(bytes: Uint8Array): string {
    let hex = '0x'
    if (bytes === undefined || bytes.length === 0) return hex
    for (const byte of bytes) {
        hex += hexByByte[byte]
    }
    return hex
}
