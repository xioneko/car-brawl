export type RevAccount = {
    name: string
    readonly revAddr: string
} & (
    | { readonly ethAddr: string }
    | { readonly privKey: string; readonly pubKey?: string }
)

export type GuestAccount = { name: 'guest' }
