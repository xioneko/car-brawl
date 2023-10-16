/**
 * REV 地址必须有，ETH 地址和 PrivateKey 具有其中之一
 * ETH 或 PrivateKey 用于给合约签名
 */
export type RevAccount = {
    name?: string
    readonly revAddr: string
} & (
    | { readonly ethAddr: string }
    | { readonly privKey: string; readonly pubKey?: string }
)
