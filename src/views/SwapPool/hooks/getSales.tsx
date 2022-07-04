import { getSwapPoolFactoryContract } from "utils/contractHelpers";
import { AddressZero } from '@ethersproject/constants'
import swapPoolAbi from 'config/abi/swapPool.json'
import { LAUNCHPAD_BLACKLIST } from "config/constants/launchpad";
import multicall from "utils/multicall";
import BigNumber from "bignumber.js";
import { BIG_ZERO } from "utils/bigNumber";
import { ethers } from "ethers";
import { PublicSaleData } from "../types";

interface SaleConfigParams {
    saleRate: ethers.BigNumber
    saleRateDecimals: ethers.BigNumber
    softCap: ethers.BigNumber
    hardCap: ethers.BigNumber
    minContribution: ethers.BigNumber
    maxContribution: ethers.BigNumber
    startTime: ethers.BigNumber
    endTime: ethers.BigNumber
    wallet: string
    router: string
    mainToken: string
    payToken: string
    whitelistEnabled: boolean
    name: string
}

interface SaleUserData {
    contribution: BigNumber
    purchasedAmount: BigNumber
    claimedAmount: BigNumber
    claimableTokenAmount: BigNumber
    whitelisted: boolean
}


export const getSales = async (start: number, count: number) : Promise<PublicSaleData[]> => {
    if (count === 0) {
        return [];
    }

    const saleFactoryContract = getSwapPoolFactoryContract()
    const saleAddresses: string[] = await saleFactoryContract.getSales(start, start+count)
    const fields = ['getConfiguration', 'owner', 'weiRaised', 'finalized', 'canceled', 'deposited', 'name']

    const calls = saleAddresses.reduce((accum, address, index) => {
        fields.forEach((field) => {
            accum.push({
                address,
                name: field,
                params: []
            })
        });
        return accum
    }, [])

    const response = await multicall(swapPoolAbi, calls)

    const res = response.reduce((accum: any[][], item, index) => {
        const chunk = Math.floor(index / 7)
        const chunks = accum
        chunks[chunk] = ([] as any[]).concat(accum[chunk] || [], item)
        return chunks
    }, []).map((item, index) => {
        const config: SaleConfigParams = item[0]
        return {
            name: item[6],
            address: saleAddresses[index],
            owner: item[1],
            token: config.mainToken,
            wallet: config.wallet,
            weiRaised: new BigNumber(item[2]._hex),
            goal: new BigNumber(config.softCap._hex),
            cap: new BigNumber(config.hardCap._hex),
            rate: new BigNumber(config.saleRate._hex),
            rateDecimals: new BigNumber(config.saleRateDecimals._hex).toNumber(),
            openingTime: new BigNumber(config.startTime._hex).toNumber(),
            closingTime: new BigNumber(config.endTime._hex).toNumber(),
            finalized: item[3],
            canceled: item[4],
            baseToken: config.payToken,
            deposited: item[5],
        }
    }).filter((item) => {
        return !LAUNCHPAD_BLACKLIST.includes(item.address.toLowerCase())
    })

    return res
}

export const getSaleUserData = async (address?: string, account?: string) : Promise<SaleUserData> => {
    if (!address || !account) {
        return {contribution: null, purchasedAmount: null, claimedAmount: null, claimableTokenAmount: null, whitelisted: false}
    }
    
    const calls = [
        {
            address,
            name: 'userContributions',
            params: [account]
        },
        {
            address,
            name: 'userTokenTally',
            params: [account]
        },
        {
            address,
            name: 'userTokenClaimed',
            params: [account]
        },
        {
            address,
            name: 'claimableAmount',
            params: [account]
        },
        {
            address,
            name: 'whitelist',
            params: [account]
        }
    ]

    const [
        [contribution_], 
        [purchasedAmount_],
        [claimedAmount_],
        [claimableTokenAmount_],
        [whitelisted]
    ] = await multicall(swapPoolAbi, calls)
    
    const contribution = contribution_ ? new BigNumber(contribution_._hex) : BIG_ZERO;
    const purchasedAmount = purchasedAmount_ ? new BigNumber(purchasedAmount_._hex) : BIG_ZERO;
    const claimedAmount = claimedAmount_ ? new BigNumber(claimedAmount_._hex) : BIG_ZERO;
    const claimableTokenAmount = claimableTokenAmount_ ? new BigNumber(claimableTokenAmount_._hex) : BIG_ZERO;
    return {contribution, purchasedAmount, claimedAmount, claimableTokenAmount, whitelisted}
}

export const getSale = async (address: string) : Promise<PublicSaleData> => {
    const fields = ['name', 'getConfiguration', 'getStages', 'owner', 'weiRaised', 'finalized', 'canceled', 'deposited']

    const calls = fields.map((field) =>  {
        return {
            address,
            name: field,
            params: []
        }
    })

    const [
        [name],
        [config_], 
        [stageTimes, stagePercents],
        [owner], 
        [weiRaised_], 
        [finalized],
        [canceled],
        [deposited],
    ] = await multicall(swapPoolAbi, calls)

    const vestingInterval = new BigNumber(stageTimes[0]._hex).toNumber()
    const vestingPercent = new BigNumber(stagePercents[0]._hex).toNumber()
    const vestingEnabled = vestingInterval !== 0 || vestingPercent !== 100

    const config: SaleConfigParams = config_
    
    return {
        name,
        address,
        owner,
        token: config.mainToken,
        baseToken: config.payToken,
        wallet: config.wallet,
        weiRaised: new BigNumber(weiRaised_._hex),
        goal: new BigNumber(config.softCap._hex),
        cap: new BigNumber(config.hardCap._hex),
        rate: new BigNumber(config.saleRate._hex),
        rateDecimals: new BigNumber(config.saleRateDecimals._hex).toNumber(),
        openingTime: new BigNumber(config.startTime._hex).toNumber(),
        closingTime: new BigNumber(config.endTime._hex).toNumber(),
        finalized,
        canceled,
        minContribution: new BigNumber(config.minContribution._hex),
        maxContribution: new BigNumber(config.maxContribution._hex),
        whitelistEnabled: config.whitelistEnabled,
        vestingInterval,
        vestingPercent,
        vestingEnabled,
        deposited
    }
}
