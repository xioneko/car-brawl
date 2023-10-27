export type RevAccount = {
    readonly revAddr: string
} & (
    | { readonly ethAddr: string }
    | { readonly privKey: string; readonly pubKey?: string }
)

export type GuestAccount = { guestId: string }

export function isRevAccount(account: any): account is RevAccount {
    return 'revAddr' in account
}

export function isGuestAccount(account: any): account is GuestAccount {
    return 'guestId' in account
}
