import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { useMasterchef, useOldMasterchef } from 'hooks/useContract'
import BigNumber from 'bignumber.js'

const useHarvestFarm = (farmPid: number, isOld = false) => {
  const masterChefContract = useMasterchef()
  const oldMasterChefContract = useOldMasterchef()

  const handleHarvest = useCallback(async () : Promise<BigNumber|null> => {
    const res = await harvestFarm(isOld ? oldMasterChefContract : masterChefContract , farmPid)
    return res
  }, [farmPid, masterChefContract, oldMasterChefContract, isOld])

  return { onReward: handleHarvest }
}

export default useHarvestFarm
