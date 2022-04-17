import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { useMasterchef, useOldMasterchef } from 'hooks/useContract'

const useHarvestFarm = (farmPid: number, isOld = false) => {
  const masterChefContract = useMasterchef()
  const oldMasterChefContract = useOldMasterchef()

  const handleHarvest = useCallback(async () => {
    await harvestFarm(isOld ? oldMasterChefContract : masterChefContract , farmPid)
  }, [farmPid, masterChefContract, oldMasterChefContract, isOld])

  return { onReward: handleHarvest }
}

export default useHarvestFarm
