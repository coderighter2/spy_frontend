import { useCallback } from 'react'
import { harvestNFT } from 'utils/calls'
import { useGeneralNFTReward, useOldGeneralNFTReward, useNFTSignatureRewardContract } from 'hooks/useContract'
import { isSpyNFT } from '../helpers'

const useHarvestNFT = () => {
  const nftRewardContract = useGeneralNFTReward()
  const oldNftRewardContract = useOldGeneralNFTReward()
  const nftSignatureRewardContract = useNFTSignatureRewardContract()

  const hanleHarvestNFT = useCallback(async (nftAddress: string, isV2 = true) => {
    const txHash = isSpyNFT(nftAddress) ? (isV2 ? await harvestNFT(nftRewardContract) : await harvestNFT(oldNftRewardContract)) : await harvestNFT(nftSignatureRewardContract)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract, nftSignatureRewardContract])

  return { onHarvest: hanleHarvestNFT }
}

export default useHarvestNFT
