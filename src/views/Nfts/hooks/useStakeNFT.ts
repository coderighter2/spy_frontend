import { useCallback } from 'react'
import { stakeNFT, stakeNFTMulti } from 'utils/calls'
import { useGeneralNFTReward, useNFTSignatureRewardContract, useOldGeneralNFTReward } from 'hooks/useContract'
import { isSpyNFT } from '../helpers'

const useStakeNFT = () => {
  const nftRewardContract = useGeneralNFTReward()
  const oldNftRewardContract = useOldGeneralNFTReward()
  const nftSignatureRewardContract = useNFTSignatureRewardContract()

  const handleStakeNFT = useCallback(async (nftAddress: string, tokenId: string, isV2 = true) => {
    const txHash = isSpyNFT(nftAddress) ? ( isV2 ? await stakeNFT(nftRewardContract, tokenId) : await stakeNFT(oldNftRewardContract, tokenId) ) : await stakeNFT(nftSignatureRewardContract, tokenId)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract, nftSignatureRewardContract])

  const handleStakeNFTMulti = useCallback(async (nftAddress: string, tokenIds: string[], isV2 = true) => {
    const txHash = isSpyNFT(nftAddress) ? (isV2 ? await stakeNFTMulti(nftRewardContract, tokenIds) : await stakeNFT(oldNftRewardContract, tokenIds[0]) ) : await stakeNFTMulti(nftSignatureRewardContract, tokenIds)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract, nftSignatureRewardContract])

  return { onStakeNFT: handleStakeNFT, onStakeNFTMulti: handleStakeNFTMulti }
}

export default useStakeNFT
