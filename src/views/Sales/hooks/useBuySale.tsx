import { useCallback } from 'react'
import { callWithEstimateGas } from 'utils/calls'
import { useSaleContract } from 'hooks/useContract'
import getGasPrice from 'utils/getGasPrice'

export const useBuySale = (address: string) => {
  const saleContract = useSaleContract(address)

  const handleBuyETH = useCallback(async (account: string, amount: string) => {

    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'buyWithETH', [], {gasPrice}, 1000, amount)
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  const handleBuy = useCallback(async (account: string, amount: string) => {

    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'buyWithToken', [amount], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  return { onBuySaleETH: handleBuyETH, onBuySale: handleBuy }
}

export const useClaimSale = (address: string) => {
  const saleContract = useSaleContract(address)

  const handleClaim = useCallback(async (account: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'claim', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  return { onClaimSale: handleClaim }
}

export const useClaimRefundSale = (address: string) => {
  const saleContract = useSaleContract(address)

  const handleClaimRefund = useCallback(async (account: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'claimRefund', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  const handleEmergencyWithdraw = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'emergencyWithdraw', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  return { onClaimRefundSale: handleClaimRefund, onEmergencyWithdraw: handleEmergencyWithdraw }
}

export const useFinalizeSale = (address: string) => {
  const saleContract = useSaleContract(address)

  const handleFinalize = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'finalize', [], {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  return { onFinalize: handleFinalize }
}



export const useUpdateSaleMeta = (address: string) => {
  const saleContract = useSaleContract(address)

  const handleUpdateMeta = useCallback(async (logo, website, facebook, twitter, instagram, telegram, github, discord, reddit, description) => {
    const args = [logo, website, twitter, facebook, telegram, instagram, github, discord, reddit, description]
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(saleContract, 'updateMeta', args, {gasPrice})
    const receipt = await tx.wait()
    return receipt.status
  }, [saleContract])

  return { onUpdateMeta: handleUpdateMeta }
}