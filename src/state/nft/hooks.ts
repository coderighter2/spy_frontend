import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@web3-react/core'

import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'
import { BIG_ZERO } from 'utils/bigNumber'
import useRefresh from 'hooks/useRefresh'
import { fetchNFTAllowancesAsync, fetchNFTPoolPublicDataAsync, fetchNFTPoolUserDataAsync, fetchNFTSignatureFactoryPublicDataAsync, fetchNFTSignaturePoolPublicDataAsync, fetchNFTSignaturePoolUserDataAsync, fetchNFTSignatureUserBalanceDataAsync, fetchNFTUserBalanceDataAsync, fetchNFTUserDataAsync } from '.'
import { DeserialzedNFTPoolUserData, DeserialzedNFTPoolPublicData, State } from '../types'


export const usePollNFTPublicData = () => {
    const dispatch = useAppDispatch()
    const { slowRefresh } = useRefresh()
    const { account } = useWeb3React()
    useEffect(() => {
      dispatch(fetchNFTPoolPublicDataAsync())
      if (account) {
        dispatch(fetchNFTUserDataAsync({account}))
        dispatch(fetchNFTPoolUserDataAsync({account}))
        dispatch(fetchNFTUserBalanceDataAsync({account}))
      }
      
    }, [dispatch, slowRefresh, account])
}

export const usePollNFTSignaturePublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()
  useEffect(() => {
    dispatch(fetchNFTSignaturePoolPublicDataAsync())
    dispatch(fetchNFTSignatureFactoryPublicDataAsync())
    if (account) {
      dispatch(fetchNFTUserDataAsync({account}))
      dispatch(fetchNFTSignaturePoolUserDataAsync({account}))
      dispatch(fetchNFTSignatureUserBalanceDataAsync({account}))
    }
    
  }, [dispatch, slowRefresh, account])
}

export const usePollNFTAllowanceData = () => {
    const dispatch = useAppDispatch()
    const { account } = useWeb3React()
    useEffect(() => {
      if (account) {
        dispatch(fetchNFTAllowancesAsync({account}))
      }
      
    }, [dispatch, account])
}

export const useNFTBalances = (nftAddress?: string) => {
  const nftBalance = useSelector((state: State) => state.nft.nftBalance)
  const signatureBalance = useSelector((state: State) => state.nft.signatureBalance)

  const balance = nftAddress?.toLowerCase() === tokens.signature.address.toLowerCase() ? signatureBalance : nftBalance

  const deserlizedNFTBalance = balance.map((gego) => {
    return {
      address: gego.address,
      staked: gego.staked,
      id: gego.id,
      grade: gego.grade,
      lockedDays: gego.lockedDays,
      blockNum: new BigNumber(gego.blockNum),
      createdTime: gego.createdTime,
      quality: gego.quality,
      amount: new BigNumber(gego.amount),
      resBaseId: new BigNumber(gego.resBaseId),
      efficiency: gego.efficiency ? new BigNumber(gego.efficiency) : BIG_ZERO,
      expiringTime: gego.expiringTime ? new BigNumber(gego.expiringTime) : undefined
    }
  })

  return deserlizedNFTBalance
}

export const useOldNFTBalances = () => {
  const nftBalance = useSelector((state: State) => state.nft.oldNftBalance)

  const deserlizedNFTBalance = nftBalance.map((gego) => {
    return {
      address: gego.address,
      staked: gego.staked,
      id: gego.id,
      grade: gego.grade,
      lockedDays: gego.lockedDays,
      blockNum: new BigNumber(gego.blockNum),
      createdTime: gego.createdTime,
      quality: gego.quality,
      amount: new BigNumber(gego.amount),
      efficiency: gego.efficiency ? new BigNumber(gego.efficiency) : BIG_ZERO
    }
  })

  return deserlizedNFTBalance
}

export const useNFTCastAllowance = () =>  {
  const castNFTAllowance = useSelector((state: State) => state.nft.castNFTAllowance)
  const castSignatureAllowance = useSelector((state: State) => state.nft.castSignatureAllowance)
  return {
    signature: castSignatureAllowance ? new BigNumber(castSignatureAllowance) : BIG_ZERO,
    nft: castNFTAllowance ? new BigNumber(castNFTAllowance) : BIG_ZERO
  }
}

export const useNFTSignatureCastAllowance = () =>  {
  const castSignatureAllowance = useSelector((state: State) => state.nft.castSignatureAllowance)
  return castSignatureAllowance ? new BigNumber(castSignatureAllowance) : BIG_ZERO
}

export const useNFTSignatureFactoryData = () => {
  const publicData = useSelector((state: State) => state.nft.signatureFactoryData)
  return {
    activeRuleId: publicData ? new BigNumber(publicData.activeRuleId) : BIG_ZERO,
    maxMintAmount: publicData ? new BigNumber(publicData.maxMintAmount) : BIG_ZERO,
    maxMintQuantity: publicData ? new BigNumber(publicData.maxMintQuantity) : BIG_ZERO,
    maxMintQuantityPerClick: publicData ? new BigNumber(publicData.maxMintQuantityPerClick) : BIG_ZERO,
    mintCost: publicData ? new BigNumber(publicData.mintCost) : BIG_ZERO,
    mintCostDiscount: publicData ? new BigNumber(publicData.mintCostDiscount) : BIG_ZERO,
    mintCostDiscountQuantity: publicData ? new BigNumber(publicData.mintCostDiscountQuantity) : BIG_ZERO,
    mintedQuantity: publicData ? new BigNumber(publicData.mintedQuantity) : BIG_ZERO,
    costToken: publicData ? publicData.costToken : undefined,
  }
}

export const useNFTFactoryAllowance = () => {
  return useSelector((state: State) => state.nft.factoryAllowance)
}

export const useNFTRewardAllowance = () => {
  return useSelector((state: State) => state.nft.rewardAllowance)
}

export const useNFTMarketplaceAllowance = (nftAddress?: string) => {

  const marketplaceAllowance = useSelector((state: State) => state.nft.marketplaceAllowance)
  const signatureMarketplaceAllowance = useSelector((state: State) => state.nft.signatureMarketplaceAllowance)

  const allowance = nftAddress?.toLowerCase() === tokens.signature.address.toLowerCase() ? signatureMarketplaceAllowance : marketplaceAllowance
  return allowance
}

export const useOldNFTRewardAllowance = () => {
  return useSelector((state: State) => state.nft.oldRewardAllowance)
}

export const useNFTSignatureRewardAllowance = () => {
  return useSelector((state: State) => state.nft.signatureRewardAllowance)
}
export const useNFTPoolUserData = () : DeserialzedNFTPoolUserData => {
  const userData = useSelector((state: State) => state.nft.poolUserData)
  return {
    balance: userData ? new BigNumber(userData.balance) : BIG_ZERO,
    earning: userData ? new BigNumber(userData.earning) : BIG_ZERO,
    nextHarvestUntil: userData ? userData.nextHarvestUntil : 0,
    userDataLoaded: userData ? userData.userDataLoaded : false
  }
}
export const useOldNFTPoolUserData = () : DeserialzedNFTPoolUserData => {
  const userData = useSelector((state: State) => state.nft.oldPoolUserData)
  return {
    balance: userData ? new BigNumber(userData.balance) : BIG_ZERO,
    earning: userData ? new BigNumber(userData.earning) : BIG_ZERO,
    nextHarvestUntil: userData ? userData.nextHarvestUntil : 0,
    userDataLoaded: userData ? userData.userDataLoaded : false
  }
}
export const useNFTSignaturePoolUserData = () : DeserialzedNFTPoolUserData => {
  const userData = useSelector((state: State) => state.nft.signaturePoolUserData)
  return {
    balance: userData ? new BigNumber(userData.balance) : BIG_ZERO,
    earning: userData ? new BigNumber(userData.earning) : BIG_ZERO,
    nextHarvestUntil: userData ? userData.nextHarvestUntil : 0,
    userDataLoaded: userData ? userData.userDataLoaded : false
  }
}

export const useNFTPoolPublicData = () : DeserialzedNFTPoolPublicData => {
  const publidData = useSelector((state: State) => state.nft.poolPublicData)
  return {
    harvestInterval: publidData ? publidData.harvestInterval : 0,
    periodFinish: publidData ? publidData.periodFinish : 0,
    rewardPerTokenStored: publidData ? new BigNumber(publidData.rewardPerTokenStored) : BIG_ZERO,
    rewardRate: publidData ? new BigNumber(publidData.rewardRate) : BIG_ZERO,
    rewardPrecisionFactor: publidData ? new BigNumber(publidData.rewardPrecisionFactor) : BIG_ZERO,
    totalSupply: publidData ? new BigNumber(publidData.totalSupply) : BIG_ZERO,
    totalBalance: publidData ? new BigNumber(publidData.totalBalance) : BIG_ZERO,
    harvestFee: publidData ? new BigNumber(publidData.harvestFee) : BIG_ZERO
  }
}

export const useOldNFTPoolPublicData = () : DeserialzedNFTPoolPublicData => {
  const publidData = useSelector((state: State) => state.nft.oldPoolPublicData)
  return {
    harvestInterval: publidData ? publidData.harvestInterval : 0,
    periodFinish: publidData ? publidData.periodFinish : 0,
    rewardPerTokenStored: publidData ? new BigNumber(publidData.rewardPerTokenStored) : BIG_ZERO,
    rewardRate: publidData ? new BigNumber(publidData.rewardRate) : BIG_ZERO,
    rewardPrecisionFactor: publidData ? new BigNumber(publidData.rewardPrecisionFactor) : BIG_ZERO,
    totalSupply: publidData ? new BigNumber(publidData.totalSupply) : BIG_ZERO,
    totalBalance: publidData ? new BigNumber(publidData.totalBalance) : BIG_ZERO,
    harvestFee: publidData ? new BigNumber(publidData.harvestFee) : BIG_ZERO
  }
}


export const useNFTSignaturePoolPublicData = () : DeserialzedNFTPoolPublicData => {
  const publidData = useSelector((state: State) => state.nft.signaturePoolPublicData)
  return {
    harvestInterval: publidData ? publidData.harvestInterval : 0,
    periodFinish: publidData ? publidData.periodFinish : 0,
    rewardPerTokenStored: publidData ? new BigNumber(publidData.rewardPerTokenStored) : BIG_ZERO,
    rewardRate: publidData ? new BigNumber(publidData.rewardRate) : BIG_ZERO,
    rewardPrecisionFactor: publidData ? new BigNumber(publidData.rewardPrecisionFactor) : BIG_ZERO,
    totalSupply: publidData ? new BigNumber(publidData.totalSupply) : BIG_ZERO,
    totalBalance: publidData ? new BigNumber(publidData.totalBalance) : BIG_ZERO,
    harvestFee: publidData ? new BigNumber(publidData.harvestFee) : BIG_ZERO
  }
}