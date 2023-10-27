export interface DeployData {
    readonly term: string
    readonly timestamp: number
    readonly phloPrice: number
    readonly phloLimit: number
    readonly validAfterBlockNumber: number
}

export interface DeployRequest {
    readonly data: DeployData
    readonly sigAlgorithm: string
    readonly deployer: string
    readonly signature: string
}

export interface DeployInfo {
    readonly timestamp: number
    readonly term: string
    readonly phloPrice: number
    readonly phloLimit: number
    readonly cost: number
    readonly sig: string
    readonly sigAlgorithm: 'secp256k1' | 'secp256k1:eth'
    readonly validAfterBlockNumber: number
    readonly systemDeployError?: string
    readonly errored?: string
}

export namespace GetLatestBlockNumber {
    export interface Req {}

    export interface Res {
        blockNum: number
    }
}

export namespace PostDeploy {
    export interface Req {
        deployRequest: DeployRequest
        ack?: string
    }

    export type Res = { data?: any }
}

export namespace GetBalance {
    export interface Req {
        revAddr: string
    }

    export interface Res {
        amount: number
    }
}

export namespace PostFaucet {
    export interface Req {
        revAddr: string
    }

    export interface Res {
        error?: string
    }
}
