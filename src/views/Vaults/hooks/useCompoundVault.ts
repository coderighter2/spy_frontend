import { useCallback } from 'react'
import { Contract, ethers } from 'ethers'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'

const useCompoundVault = (vaultContract: Contract) => {
  const { callWithGasPrice } = useCallWithGasPrice()
  const handleCompound = useCallback(async () => {
    const tx = await callWithGasPrice(vaultContract, 'compound', [])
    const receipt = await tx.wait()
    return receipt.status
  }, [vaultContract, callWithGasPrice])

  return { onCompound: handleCompound }
}

export default useCompoundVault
