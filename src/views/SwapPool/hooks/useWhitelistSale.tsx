import { useSwapPoolContract } from "hooks/useContract"
import { useCallback } from "react"
import { callWithEstimateGas } from "utils/calls"
import getGasPrice from "utils/getGasPrice"


export const useSaleWhitelistEnabled = (address: string) => {
    const swapPoolContract = useSwapPoolContract(address)
  
    const handleEnableWhitelist = useCallback(async (enabled: boolean) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(swapPoolContract, 'setWhitelistEnabled', [enabled], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [swapPoolContract])
  
    return { onEnableWhitelist: handleEnableWhitelist }
}

export const useSaleWhitelist = (address: string) => {
    const swapPoolContract = useSwapPoolContract(address)
  
    const handleAddWhitelist = useCallback(async (accounts) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(swapPoolContract, 'whitelistAddresses', [accounts, accounts.map((item) => true)], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [swapPoolContract])
  
    const handleRemoveWhitelist = useCallback(async (accounts) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(swapPoolContract, 'whitelistAddresses', [accounts, accounts.map((item) => false)], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [swapPoolContract])
  
    return { onAddWhitelist: handleAddWhitelist, onRemoveWhitelist: handleRemoveWhitelist }
}