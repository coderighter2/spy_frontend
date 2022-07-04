import { useCallback } from 'react'
import { useSwapPoolContract} from 'hooks/useContract'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'

export const useDepositeSale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleDeposite = useCallback(
    async () => {
        const gasPrice = getGasPrice()
        const tx = await callWithEstimateGas(swapPoolContract, 'deposit', [], { gasPrice})
        const receipt = await tx.wait()
        return receipt
    },
    [swapPoolContract],
  )

  return { onDeposite: handleDeposite }
}

export const useCancelSale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleCancel = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'cancel', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  return { onCancel: handleCancel }
}