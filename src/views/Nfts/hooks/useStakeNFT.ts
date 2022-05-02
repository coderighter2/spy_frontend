import { useCallback } from 'react'
import { stakeNFT, stakeNFTMulti } from 'utils/calls'
import { useGeneralNFTReward, useOldGeneralNFTReward } from 'hooks/useContract'

const useStakeNFT = () => {
  const nftRewardContract = useGeneralNFTReward()
  const oldNftRewardContract = useOldGeneralNFTReward()

  const handleStakeNFT = useCallback(async (tokenId: string, isV2 = true) => {
    const txHash = isV2 ? await stakeNFT(nftRewardContract, tokenId) : await stakeNFT(oldNftRewardContract, tokenId)
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract])

  const handleStakeNFTMulti = useCallback(async (tokenIds: string[], isV2 = true) => {
    const txHash = isV2 ? await stakeNFTMulti(nftRewardContract, tokenIds) : await stakeNFT(oldNftRewardContract, tokenIds[0])
    console.info(txHash)
  }, [nftRewardContract, oldNftRewardContract])

  return { onStakeNFT: handleStakeNFT, onStakeNFTMulti: handleStakeNFTMulti }
}

export default useStakeNFT
