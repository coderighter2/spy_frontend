import BigNumber from 'bignumber.js'
import nftSignatureFactoryABI from 'config/abi/nftSignatureFactory.json'
import tokens from 'config/constants/tokens'
import multicall from 'utils/multicall'
import { getNFTSignatureFactoryAddress } from 'utils/addressHelpers'
import { getFixRate } from 'utils/nftHelpers'
import { PublicNFTData } from './fetchNFTData'

export const fetchNFTSignatureGegos = async (tokenIds: string[]): Promise<PublicNFTData[]> => {
    
    const factoryAddress = getNFTSignatureFactoryAddress()
    const calls = tokenIds.map((tokenId) => {
        return { address: factoryAddress, name: 'getGego', params: [tokenId] }
    })

    const rawNFTGegos = await multicall(nftSignatureFactoryABI, calls)
    const parsedNFTGegos = rawNFTGegos.map((rawNFTGego, index) => {
        const quality = new BigNumber(rawNFTGego.quality?._hex).toNumber()
        const grade = new BigNumber(rawNFTGego.grade?._hex).toNumber()
        const efficiency = getFixRate(grade, quality, tokens.signature.address).toJSON()
        return {
            address: tokens.signature.address,
            id: tokenIds[index],
            grade,
            lockedDays: new BigNumber(rawNFTGego.lockedDays?._hex).toNumber(),
            blockNum: new BigNumber(rawNFTGego.blockNum?._hex).toJSON(),
            createdTime: new BigNumber(rawNFTGego.createdTime?._hex).toNumber(),
            resBaseId: new BigNumber(rawNFTGego.resBaseId?._hex).toJSON(),
            quality,
            amount: new BigNumber(rawNFTGego.amount?._hex).toJSON(),
            efficiency,
            expiringTime:  new BigNumber(rawNFTGego.expiringTime?._hex).toJSON(),
            staked: false
        }
    })
    

    return parsedNFTGegos;
}