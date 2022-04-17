import { useCallback } from 'react'
import { ethers, Contract } from 'ethers'
import { useMasterchef, useOldMasterchef } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'

const useApproveFarm = (lpContract: Contract, isOld = false) => {
  const masterChefContract = useMasterchef()
  const oldMasterChefContract = useOldMasterchef()
  const { callWithGasPrice } = useCallWithGasPrice()
  const handleApprove = useCallback(async () => {
    const tx = await callWithGasPrice(lpContract, 'approve', [isOld ? oldMasterChefContract.address : masterChefContract.address, ethers.constants.MaxUint256])
    const receipt = await tx.wait()
    return receipt.status
  }, [lpContract, isOld, masterChefContract, oldMasterChefContract, callWithGasPrice])

  return { onApprove: handleApprove }
}

export default useApproveFarm
