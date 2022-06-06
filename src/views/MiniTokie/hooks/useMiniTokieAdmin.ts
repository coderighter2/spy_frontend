import { useCallback, useMemo } from 'react'
import { useMiniTokieContract } from 'hooks/useContract'
import tokens from 'config/constants/tokens'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'

export const useMiniTokieToggleFee = () => {
    const miniTokie = useMiniTokieContract(tokens.minitokie.address)

    const handleToggleFee = useCallback(async (enabled: boolean) => {
        const gasPrice = getGasPrice()
        const tx = await callWithEstimateGas(miniTokie, 'setFeeEnabled', [enabled], {gasPrice})
        const receipt = await tx.wait()
        return receipt.transactionHash
    }, [miniTokie])

    return {onToggleFee: handleToggleFee}
}

export const useMiniTokieToggleAntiBot = () => {
    const miniTokie = useMiniTokieContract(tokens.minitokie.address)

    const handleToggleAntiBot = useCallback(async (enabled: boolean) => {
        const gasPrice = getGasPrice()
        const tx = await callWithEstimateGas(miniTokie, 'setUsingAntiBot', [enabled], {gasPrice})
        const receipt = await tx.wait()
        return receipt.transactionHash
    }, [miniTokie])

    return {onToggleAntiBot: handleToggleAntiBot}
}

export const useExcludeFromFee = () => {
    const miniTokie = useMiniTokieContract(tokens.minitokie.address)

    const handleExclude = useCallback(async (address: string) => {
        const gasPrice = getGasPrice()
        const tx = await callWithEstimateGas(miniTokie, 'excludeAccountFromFee', [address], {gasPrice})
        const receipt = await tx.wait()
        return receipt.transactionHash
    }, [miniTokie])

    const handleInclude = useCallback(async (address: string) => {
        const gasPrice = getGasPrice()
        const tx = await callWithEstimateGas(miniTokie, 'includeAccountFromFee', [address], {gasPrice})
        const receipt = await tx.wait()
        return receipt.transactionHash
    }, [miniTokie])

    return {onExclude: handleExclude, onInclude: handleInclude}
}
