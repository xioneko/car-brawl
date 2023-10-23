export type RevAccount = {
    readonly revAddr: string
} & (
    | { readonly ethAddr: string }
    | { readonly privKey: string; readonly pubKey?: string }
)

export type GuestAccount = { id: 'string' }

export function isRevAccount(
    account: RevAccount | GuestAccount,
): account is RevAccount {
    return 'revAddr' in account
}

export function isGuestAccount(
    account: RevAccount | GuestAccount,
): account is GuestAccount {
    return 'id' in account
}
