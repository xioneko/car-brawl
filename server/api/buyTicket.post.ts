import * as ethUtil from '@ethereumjs/util'
import { useLogger } from '@nuxt/kit'
import { sendDeploy, propose, dataAtName } from '../rchain/http'
import { DeployData, DeployRequest, PostBuyTicket, RevAccount } from '~/models'

const logger = useLogger('BuyTicket Service')

export default defineEventHandler(async (event): Promise<PostBuyTicket.Res> => {
    const {
        deploy: deployData,
        account,
        signature: sigHex,
    } = await readBody<PostBuyTicket.Req>(event)
    try {
        verify(account, deployData, sigHex)

        const pubKeyHex = recoverPublicKeyEth(
            deployDataProtobufSerialize(deployData),
            sigHex,
        )
        // For debug: 048f76a5f4108738ebdd2169f3e8a9d7cea268988d59a335366eb6cc13f073ae6a26bcb0ec739f3963c7b4d4ec2d63a23944b64e1e113ef7154b369565d9df40ec
        const deployRequest: DeployRequest = {
            data: deployData,
            sigAlgorithm: 'secp256k1:eth',
            signature: remove0x(sigHex),
            deployer: remove0x(pubKeyHex),
        }

        await sendDeploy(deployRequest)

        await propose()

        const deployId = deployRequest.signature
        await checkDeployStatus(deployId, (errored, systemDeployError) => {
            logger.debug('Deploy status:', systemDeployError)
            throw createError({
                statusCode: 400,
                message: 'Do you have enough REV?',
            })
        })
        const [success, msg] = await dataAtName<[boolean, string]>(deployId)

        if (success) {
            const accessToken = encrypt(account.revAddr)
            return { accessToken }
        }

        return { error: msg }
    } catch (error) {
        logger.debug(error)
        throw error
    }
})

function verify(account: RevAccount, deploy: DeployData, signature: string) {
    // TODO:
    // 1. 验证提交的 deploy 执行了 @"BuyTicket" 合约
    // 2. 验证 account 属于部署者
}

function recoverPublicKeyEth(data: Uint8Array, sigHex: string) {
    const hashed = ethUtil.hashPersonalMessage(data)
    const { v, r, s } = ethUtil.fromRpcSig(sigHex)
    const pubKeyRecover = ethUtil.ecrecover(hashed, v, r, s)
    return ethUtil.bytesToHex(Uint8Array.from([4, ...pubKeyRecover]))
}

function remove0x(hexStr: string) {
    return hexStr.replace(/^0x/, '')
}
