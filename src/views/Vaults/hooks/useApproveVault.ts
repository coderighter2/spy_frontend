import { useCallback } from 'react'
import { ethers } from 'ethers'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'

const useApproveVault = (vaultAddress: string) => {
  const { callWithGasPrice } = useCallWithGasPrice()
  const handleApprove = useCallback(async (tokenContract) => {
    const tx = await callWithGasPrice(tokenContract, 'approve', [vaultAddress, ethers.constants.MaxUint256])
    const receipt = await tx.wait()
    return receipt.status
  }, [vaultAddress, callWithGasPrice])

  return { onApprove: handleApprove }
}

export default useApproveVault
