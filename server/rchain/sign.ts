import blake from 'blakejs'
import { BinaryWriter } from 'google-protobuf'
import elliptic from 'elliptic'
import type { DeployData, DeployRequest } from '~/models/protocol'

const SystemPrivKey = process.env.BOOT_PRIVATE_KEY!

export function signDeploy(
    deployData: DeployData,
    privateKey: string = SystemPrivKey,
): DeployRequest {
    const sigAlgorithm = 'secp256k1'
    const deploySerialized = deployDataProtobufSerialize(deployData)
    // eslint-disable-next-line
    const crypt = new elliptic.ec(sigAlgorithm)
    const keyPair = crypt.keyFromPrivate(privateKey)
    const deployer = keyPair.getPublic('hex')

    const hashed = blake.blake2bHex(deploySerialized, undefined, 32)
    const signature = keyPair.sign(hashed, { canonical: true }).toDER('hex')

    return {
        data: deployData,
        sigAlgorithm,
        deployer,
        signature,
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
