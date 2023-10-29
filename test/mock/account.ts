import type { RevAccount, GuestAccount } from '~/models/account'

export function mockRevAccount(revAddr?: string, privKey?: string): RevAccount {
    const account = useAccountStore()
    account.$patch({
        revAddr:
            revAddr ?? '1111dutpn66C9c8idredGotkAQddh2N62hxBRSaSSBD9D76dwQpTm', // cspell: disable-line
        privKey:
            privKey ??
            '1a9a904611a5cba31f84cc11e10b384345ec50e1ac0243e93289607b8c65038f',
    })
    return account as RevAccount
}

export function mockGuestAccount(prefix: string = 'mock'): GuestAccount {
    const account = useAccountStore()
    const guestId = `${prefix}_${Math.random().toString(36).slice(-8)}`
    account.$patch({ guestId })
    return account as GuestAccount
}
