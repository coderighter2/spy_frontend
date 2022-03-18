import { useCallback } from 'react'
import { stakeBNBVault, stakeLPBNBVault, stakeLPVault, stakeVault } from 'utils/calls'
import { useBNBVaultContract, useCompoundVaultContract } from 'hooks/useContract'
import { useUserReferrer } from 'state/user/hooks'

const useStakeVault = (contractAddress, isETH) => {
  const bnbVault = useBNBVaultContract(contractAddress)
  const compoundVault = useCompoundVaultContract(contractAddress)
  const [ userReferrer, _] = useUserReferrer()

  const handleStake = useCallback(
    async (amount: string) => {
      let txHash: number
      if (isETH) {
        txHash = await stakeBNBVault(bnbVault, amount, userReferrer)
      } else {
        txHash = await stakeVault(compoundVault, amount, userReferrer)
      }
      console.info(txHash)
    },
    [bnbVault, compoundVault, isETH, userReferrer],
  )

  const handleStakeLP = useCallback(
    async (amount: string) => {
      let txHash: number
      if (isETH) {
        txHash = await stakeLPBNBVault(bnbVault, amount, userReferrer)
      } else {
        txHash = await stakeLPVault(compoundVault, amount, userReferrer)
      }
      console.info(txHash)
    },
    [bnbVault, compoundVault, isETH, userReferrer],
  )

  return { onStake: handleStake, onStakeLP: handleStakeLP }
}

export default useStakeVault
