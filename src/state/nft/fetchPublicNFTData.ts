import BigNumber from 'bignumber.js'
import erc20 from 'config/abi/erc20.json'
import tokens from 'config/constants/tokens'
import multicall from 'utils/multicall'
import { getNFTMintroxyAddress, getNFTSignatureMintProxyAddress } from 'utils/addressHelpers'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { getNFTSignatureMinProxyContract } from 'utils/contractHelpers'

type PublicNFTData = {
    tokenAmountTotal: SerializedBigNumber
    nftCastAllowance: SerializedBigNumber
    nftSignatureCastAllowance: SerializedBigNumber
}

type PublicNFTFactoryData = {
    activeRuleId: SerializedBigNumber
    maxMintAmount: SerializedBigNumber
    maxMintQuantity: SerializedBigNumber
    maxMintQuantityPerClick: SerializedBigNumber
    mintCost: SerializedBigNumber
    mintCostDiscount: SerializedBigNumber
    mintCostDiscountQuantity: SerializedBigNumber
    mintedQuantity: SerializedBigNumber
    costToken: string
}

export const fetchPublicNFTData = async(account: string): Promise<PublicNFTData> =>  {

    const token = tokens.spy;

    const calls = [
        // Balance of SPY token
        {
          address: token.address,
          name: 'balanceOf',
          params: [account],
        },
        // Balance of SPY token
        {
            address: token.address,
            name: 'allowance',
            params: [account, getNFTMintroxyAddress()],
        },
        // Balance of SPY token
        {
            address: token.address,
            name: 'allowance',
            params: [account, getNFTSignatureMintProxyAddress()],
        },
        // Token decimals
        {
          address: token.address,
          name: 'decimals',
        },
    ];

    const [tokenBalance, nftCastAllowance, nftSignatureCastAllowance, spyDecimals] =
    await multicall(erc20, calls)

    const tokenAmountTotal = new BigNumber(tokenBalance).div(BIG_TEN.pow(spyDecimals))
    const nftCastAllowanceTotal = new BigNumber(nftCastAllowance).div(BIG_TEN.pow(spyDecimals))
    const nftSignatureCastAllowanceTotal = new BigNumber(nftSignatureCastAllowance).div(BIG_TEN.pow(spyDecimals))


    return {
        tokenAmountTotal: tokenAmountTotal.toJSON(),
        nftSignatureCastAllowance: nftSignatureCastAllowanceTotal.toJSON(),
        nftCastAllowance: nftCastAllowanceTotal.toJSON()
    };
}

export const fetchNFTSignatureFactoryData = async (): Promise<PublicNFTFactoryData> => {
    const mintProxyContract = getNFTSignatureMinProxyContract();
    const ruleData = await mintProxyContract.getActiveRuleData();
    const activeRuleId = new BigNumber(ruleData.ruleId._hex).toJSON();
    const maxMintAmount = new BigNumber(ruleData.maxMintAmount._hex).toJSON();
    const maxMintQuantity = new BigNumber(ruleData.maxQuantityPerBatch._hex).toJSON();
    const maxMintQuantityPerClick = new BigNumber(ruleData.maxQuantityPerClick._hex).toJSON();
    const mintCost = new BigNumber(ruleData.costErc20Amount._hex).toJSON();
    const mintCostDiscount = new BigNumber(ruleData.costErc20Discount._hex).toJSON();
    const mintCostDiscountQuantity = new BigNumber(ruleData.costErc20DiscountQunatity._hex).toJSON();
    const mintedQuantity = new BigNumber(ruleData.mintedQuantity._hex).toJSON();
    const costToken = ruleData.costErc20;

    return {
        activeRuleId,
        maxMintAmount,
        maxMintQuantity,
        maxMintQuantityPerClick,
        mintCost,
        mintCostDiscount,
        mintCostDiscountQuantity,
        mintedQuantity,
        costToken
    };
}