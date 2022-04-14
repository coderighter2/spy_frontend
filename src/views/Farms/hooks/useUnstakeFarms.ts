import { useCallback } from 'react'
import { unstakeFarm } from 'utils/calls'
import { useMasterchef, useOldMasterchef } from 'hooks/useContract'

const useUnstakeFarms = (pid: number, isOld = false) => {
  const masterChefContract = useMasterchef()
  const oldMasterChefContract = useOldMasterchef()

  const handleUnstake = useCallback(
    async (amount: string) => {
      await unstakeFarm(isOld ? oldMasterChefContract : masterChefContract, pid, amount)
    },
    [masterChefContract, oldMasterChefContract, isOld, pid],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
