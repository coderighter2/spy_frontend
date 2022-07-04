import { useCallback } from 'react'
import { callWithEstimateGas } from 'utils/calls'
import { useSwapPoolContract } from 'hooks/useContract'
import getGasPrice from 'utils/getGasPrice'
import BigNumber from 'bignumber.js'

export const useBuySale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleBuy = useCallback(async (amount: string) => {

    console.log('amount', amount)

    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'buyWithToken', [amount], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  return { onBuySale: handleBuy }
}

export const useClaimSale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleClaim = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'claim', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  return { onClaimSale: handleClaim }
}

export const useClaimRefundSale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleClaimRefund = useCallback(async (account: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'claimRefund', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  const handleEmergencyWithdraw = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'emergencyWithdraw', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  return { onClaimRefundSale: handleClaimRefund, onEmergencyWithdraw: handleEmergencyWithdraw }
}

export const useFinalizeSale = (address: string) => {
  const swapPoolContract = useSwapPoolContract(address)

  const handleFinalize = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(swapPoolContract, 'finalize', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [swapPoolContract])

  return { onFinalize: handleFinalize }
}
