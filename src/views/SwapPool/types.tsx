import BigNumber from "bignumber.js";

export enum SaleContractVersion {
    DEFAULT = 0,
    VERSION_1 = 1
}

export enum OwnerType {
    ME = "ME",
    OTHER = "OTHER"
}

export enum PaymentType {
    ESCROW = "ESCROW",
    DIRECT = "DIRECT"
}

export interface PublicSaleData {
    name?: string
    version?: SaleContractVersion
    address: string
    token: string
    owner: string
    baseToken: string
    wallet?: string
    openingTime: number
    closingTime: number
    rate: BigNumber
    rateDecimals: number
    goal: BigNumber
    cap: BigNumber
    minContribution?: BigNumber
    maxContribution?: BigNumber
    weiRaised: BigNumber
    finalized: boolean
    canceled: boolean
    deposited: boolean
    logo?: string
    whitelistEnabled?: boolean

    vestingEnabled?: boolean
    vestingPercent?: number
    vestingInterval?: number
}