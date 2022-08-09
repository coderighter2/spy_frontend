import { useCallback } from 'react'
import { getGeneralNFTRewardAddress, getNFTSignatureRewardAddress, getOldGeneralNFTRewardAddress } from 'utils/addressHelpers'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useSpyNFT } from 'hooks/useContract'
import { getAddress } from 'ethers/lib/utils'
import { isSpyNFT } from '../helpers'

const useApproveGeneralReward = (nftAddress: string) => {
  const nftContract = useSpyNFT(getAddress(nftAddress))
  const generalRewardAddress = isSpyNFT(nftAddress) ? getGeneralNFTRewardAddress() : getNFTSignatureRewardAddress()
  const oldGeneralRewardAddress = isSpyNFT(nftAddress) ? getOldGeneralNFTRewardAddress() : getNFTSignatureRewardAddress()
  
  const handleApprove = useCallback(async (isV2 = true) => {
    const gasPrice = getGasPrice()

    const tx = await callWithEstimateGas(nftContract, 'setApprovalForAll', [isV2 ?generalRewardAddress : oldGeneralRewardAddress, true], {
      gasPrice,})
    const receipt = await tx.wait()
    return receipt.status
  }, [nftContract, generalRewardAddress, oldGeneralRewardAddress])

  return { onApproveGeneralReward: handleApprove }
}

export default useApproveGeneralReward
