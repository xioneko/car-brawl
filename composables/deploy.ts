import _ from 'lodash'
import * as ethUtil from '@ethereumjs/util'
import { BinaryWriter } from 'google-protobuf'
import type {
    DeployData,
    DeployRequest,
    GetLatestBlockNumber,
    PostDeploy,
} from '~/models/http'
import type { RevAccount } from '~/models/account'

export const useDeployEffects = (
    account: RevAccount,
    code: string,
    ack?: string,
) => {
    const { data, error, status } = useAsyncData(async () => {
        const { blockNum } = await $fetch<GetLatestBlockNumber.Res>(
            '/api/latestBlockNumber',
        )

        const deployData: DeployData = {
            term: toValue(code),
            timestamp: Date.now(),
            phloPrice: 1,
            phloLimit: 50000, // TODO 根据实际情况选择更合适的值
            validAfterBlockNumber: blockNum,
        }
        if (!('ethAddr' in account)) throw new Error('Assertion Failed')
        const deployRequest = await signMetamask(deployData, account.ethAddr)

        const body: PostDeploy.Req = { deployRequest, ack }
        return $fetch<PostDeploy.Res>('/api/deploy', {
            method: 'post',
            body,
        })
    })

    return { data, error, status }
}

async function signMetamask(
    deployData: DeployData,
    ethAddr: string,
): Promise<DeployRequest> {
    const recoverPublicKeyEth = (data: Uint8Array, sigHex: string) => {
        const hashed = ethUtil.hashPersonalMessage(data)
        const { v, r, s } = ethUtil.fromRpcSig(sigHex)
        const pubKeyRecover = ethUtil.ecrecover(hashed, v, r, s)

        return ethUtil.bytesToHex(Uint8Array.from([4, ...pubKeyRecover]))
    }
    const remove0x = (hexStr: string) => hexStr.replace(/^0x/, '')

    const data = deployDataProtobufSerialize(deployData)

    // @ts-ignore
    const sigHex = await window.ethereum.request({
        method: 'personal_sign',
        params: [ethUtil.bytesToHex(data), ethAddr],
    })
    const pubKeyHex = recoverPublicKeyEth(data, sigHex)

    return {
        data: deployData,
        sigAlgorithm: 'secp256k1:eth',
        signature: remove0x(sigHex),
        deployer: remove0x(pubKeyHex),
    }
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
