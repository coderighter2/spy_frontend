import { useCallback } from 'react'
import { callWithEstimateGas, castNFT } from 'utils/calls'
import { useNFTFactory, useSpyNFT } from 'hooks/useContract'
import { DeserializedNFTGego } from 'state/types'
import { getFixRate } from 'utils/nftHelpers'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import tokens from 'config/constants/tokens'
import getGasPrice from 'utils/getGasPrice'

const useTransferNFT = () => {
  const nftContract = useSpyNFT(tokens.spynft.address)

  const handleTransferNFT = useCallback(async (tokenId: string, from: string, to: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(nftContract, "transferFrom", [from, to, tokenId], {gasPrice})
    const receipt = await tx.wait();
    return receipt.transactionHash
  }, [nftContract])

  return { onTransferNFT: handleTransferNFT }
}

export default useTransferNFT
