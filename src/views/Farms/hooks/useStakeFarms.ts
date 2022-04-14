import { useCallback } from 'react'
import { stakeFarm } from 'utils/calls'
import { useMasterchef, useOldMasterchef } from 'hooks/useContract'
import { useUserReferrer } from 'state/user/hooks'

const useStakeFarms = (pid: number, isOld = false) => {
  const masterChefContract = useMasterchef()
  const oldMasterChefContract = useOldMasterchef()
  const [ userReferrer, _] = useUserReferrer()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await stakeFarm(isOld ? oldMasterChefContract : masterChefContract, pid, amount, userReferrer)
      console.info(txHash)
    },
    [masterChefContract, oldMasterChefContract, isOld, pid, userReferrer],
  )

  return { onStake: handleStake }
}

export default useStakeFarms
