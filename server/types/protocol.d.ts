export interface DeployRequest {
    account: RevAccount
    code: string
}

export type DeployResponse = { data: any }

export interface BalanceRequest {
    revAddress: string
}

export interface BalanceResponse {
    amount: number
}
