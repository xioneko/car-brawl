import base58 from 'bs58'
import sha3 from 'js-sha3'
import blake from 'blakejs'
import { logger } from '../rchain/logger'
import { RevAccount } from '~/models/account'

export default defineEventHandler(async (event) => {
    logger.debug('debug message')
    if ('ethereum' in window) {
        // @ts-ignore
        const [ethAddr]: string[] = await window.ethereum.request({
            method: 'eth_requestAccounts',
        })
        const revAddr = createRevAddrFromEth(ethAddr)

        return <RevAccount>{ ethAddr, revAddr }
    } else {
        setResponseStatus(event, 400)
        throw new Error('Is MetaMask extension installed?')
    }
})

function createRevAddrFromEth(ethAddrRaw: string): string {
    const ethAddr = ethAddrRaw.replace(/^0x/, '')
    if (ethAddr.length !== 40) throw new Error('Unknown Eth Address format.')

    // Hash ETH address
    const ethAddrBytes = decodeBase16(ethAddr)
    const ethHash = sha3.keccak256(ethAddrBytes)

    // Add prefix with hash and calculate checksum (blake2b-256 hash)
    const prefix = { coinId: '000000', version: '00' }
    const payload = `${prefix.coinId}${prefix.version}${ethHash}`
    const payloadBytes = decodeBase16(payload)
    const checksum = blake.blake2bHex(payloadBytes, undefined, 32).slice(0, 8)

    // Return REV address
    return encodeBase58(`${payload}${checksum}`)
}

function decodeBase16(hexStr: string) {
    const removed0x = hexStr.replace(/^0x/, '')
    const byte2hex = ([arr, bhi]: [number[], string], x: string) =>
        (bhi ? [[...arr, parseInt(`${bhi}${x}`, 16)], ''] : [arr, x]) as [
            number[],
            string,
        ]
    const [resArr] = Array.from(removed0x).reduce(byte2hex, [[], ''])
    return Uint8Array.from(resArr)
}

function encodeBase58(hexStr: string) {
    const bytes = decodeBase16(hexStr)
    return base58.encode(bytes)
}
