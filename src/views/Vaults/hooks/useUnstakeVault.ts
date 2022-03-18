import { useCallback } from 'react'
import { unstakeVault, unstakeLPVault } from 'utils/calls'
import { useBNBVaultContract, useCompoundVaultContract } from 'hooks/useContract'

const useUnstakeVault = (contractAddress, isETH) => {
  const bnbVault = useBNBVaultContract(contractAddress)
  const compoundVault = useCompoundVaultContract(contractAddress)

  const handleUnstake = useCallback(
    async (amount: string, receiveToken: boolean) => {
      await unstakeVault(isETH ? bnbVault : compoundVault, amount, receiveToken)
    },
    [bnbVault, compoundVault, isETH],
  )

  const handleUnstakeLP = useCallback(
    async (lpAmount: string) => {
      await unstakeLPVault(isETH ? bnbVault : compoundVault, lpAmount)
    },
    [bnbVault, compoundVault, isETH],
  )

  return { onUnstake: handleUnstake, onUnstakeLP: handleUnstakeLP }
}

export default useUnstakeVault
