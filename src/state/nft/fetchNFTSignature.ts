import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'
import { getNFTSignatureRewardContract, getSpyNFTContract } from 'utils/contractHelpers';

export const fetchNFTSignatureBalance = async (account: string): Promise<SerializedBigNumber[]> => {

    const nftAddress = tokens.signature.address;

    const nftContract = getSpyNFTContract(nftAddress);

    const tokenIds = await nftContract.tokensOfOwner(account)

    return tokenIds.map((tokenId) => new BigNumber(tokenId._hex).toJSON())
}

export const fetchStakedNFTSignatures = async (account: string): Promise<SerializedBigNumber[]> => {
    const contract = getNFTSignatureRewardContract();
    const tokenIds = await contract.getPlayerIds(account)
    return tokenIds.map((tokenId) => new BigNumber(tokenId._hex).toJSON())
}