import { useSaleContract } from "hooks/useContract"
import { useCallback } from "react"
import { callWithEstimateGas } from "utils/calls"
import getGasPrice from "utils/getGasPrice"


export const useSaleWhitelistEnabled = (address: string) => {
    const saleContract = useSaleContract(address)
  
    const handleEnableWhitelist = useCallback(async (enabled: boolean) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(saleContract, 'setWhitelistEnabled', [enabled], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [saleContract])
  
    return { onEnableWhitelist: handleEnableWhitelist }
}

export const useSaleWhitelist = (address: string) => {
    const saleContract = useSaleContract(address)
  
    const handleAddWhitelist = useCallback(async (accounts) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(saleContract, 'whitelistAddresses', [accounts, accounts.map((item) => true)], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [saleContract])
  
    const handleRemoveWhitelist = useCallback(async (accounts) => {
      const gasPrice = getGasPrice()
      const tx = await callWithEstimateGas(saleContract, 'whitelistAddresses', [accounts, accounts.map((item) => false)], {gasPrice})
      const receipt = await tx.wait()
      return receipt.status
    }, [saleContract])
  
    return { onAddWhitelist: handleAddWhitelist, onRemoveWhitelist: handleRemoveWhitelist }
}