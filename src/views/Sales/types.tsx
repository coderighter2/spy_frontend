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
    useETH: boolean
    baseToken: string
    wallet?: string
    openingTime: number
    closingTime: number
    rate: BigNumber
    rateDecimals: number
    listingRate: BigNumber
    listingRateDecimals: number
    liquidity: number
    goal: BigNumber
    cap: BigNumber
    minContribution?: BigNumber
    maxContribution?: BigNumber
    weiRaised: BigNumber
    finalized: boolean
    canceled: boolean
    deposited: boolean
    airdropEnabled?: boolean
    logo?: string
    whitelistEnabled?: boolean

    airdropAmount?: BigNumber
    minVote?: BigNumber
    totalVotes?: BigNumber

    vestingEnabled?: boolean
    vestingPercent?: number
    vestingInterval?: number
    meta?: PublicSaleMetaData
}

export interface PublicSaleMetaData {
    website?: string
    twitter?: string
    facebook?: string
    telegram?: string
    instagram?: string
    github?: string
    discord?: string
    reddit?: string
    description?: string
}