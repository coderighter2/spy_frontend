import { useCallback } from 'react'
import { useBNBVaultContract, useCompoundVaultContract } from 'hooks/useContract'
import { harvestVault } from 'utils/calls/vaults'

const useHarvestVault = (contractAddress, isETH) => {
  const bnbVault = useBNBVaultContract(contractAddress)
  const compoundVault = useCompoundVaultContract(contractAddress)

  const handleHarvest = useCallback(async (receiveToken) => {
    await harvestVault(isETH ? bnbVault : compoundVault, receiveToken)
  }, [bnbVault, compoundVault, isETH])

  return { onReward: handleHarvest }
}

export default useHarvestVault
