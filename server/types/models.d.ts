export interface DeployData {
    readonly term: string
    readonly timestamp: number
    readonly phloPrice: number
    readonly phloLimit: number
    readonly validAfterBlockNumber: number
}

export interface Deploy {
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
