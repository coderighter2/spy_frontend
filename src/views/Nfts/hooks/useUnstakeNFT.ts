import { useCallback } from 'react'
import { exitNFT, unstakeNFT } from 'utils/calls'
import { useOldGeneralNFTReward, useGeneralNFTReward, useNFTSignatureRewardContract } from 'hooks/useContract'
import { isSpyNFT } from '../helpers'

const useUnstakeNFT = () => {
  const nftRewardContract = useGeneralNFTReward()
  const oldNftRewardContract = useOldGeneralNFTReward()
  const nftSignatureRewardContract = useNFTSignatureRewardContract()

  const handleUnstakeNFT = useCallback(async (nftAddress: string, tokenId: string, isV2 = true) => {
    const txHash = isSpyNFT(nftAddress) ? (isV2 ? await unstakeNFT(nftRewardContract, tokenId) : await unstakeNFT(oldNftRewardContract, tokenId)) : await unstakeNFT(nftSignatureRewardContract, tokenId)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract, nftSignatureRewardContract])

  const handleExitNFT = useCallback(async (nftAddress: string, isV2 = true) => {
    const txHash = isSpyNFT(nftAddress) ? (isV2 ? await exitNFT(nftRewardContract) : await exitNFT(oldNftRewardContract)) : await exitNFT(nftSignatureRewardContract)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract, nftSignatureRewardContract])

  return { onUnstakeNFT: handleUnstakeNFT, onExitNFT: handleExitNFT }
}

export default useUnstakeNFT
