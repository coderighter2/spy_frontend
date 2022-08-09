import { useCallback } from 'react'
import { castNFT, castNFTSignature, injectNFTSignature, purchaseNFTSignature } from 'utils/calls'
import { useNFTFactory, useNFTSignatureFactory } from 'hooks/useContract'
import { DeserializedNFTGego } from 'state/types'
import { getFixRate } from 'utils/nftHelpers'
import tokens from 'config/constants/tokens'

const useCastNFT = () => {
  const nftFactory = useNFTFactory()

  const handleCastNFT = useCallback(async (amount: string) : Promise<DeserializedNFTGego> => {
    const castedNFT = await castNFT(nftFactory, amount)
    return {
      ...castedNFT,
      address: tokens.spynft.address,
      staked: false,
      efficiency: getFixRate(castedNFT.grade, castedNFT.quality)
    }
  }, [nftFactory])

  return { onCastNFT: handleCastNFT }
}

export const useCastNFTSignature = () => {
  const nftSignatureFactory = useNFTSignatureFactory()

  const handleCastNFT = useCallback(async (amount, resId) : Promise<DeserializedNFTGego> => {
    const castedNFT = await castNFTSignature(nftSignatureFactory, amount, resId)
    return {
      ...castedNFT,
      address: tokens.signature.address,
      staked: false,
      efficiency: getFixRate(castedNFT.grade, castedNFT.quality, tokens.signature.address)
    }
  }, [nftSignatureFactory])

  return { onCastNFTSignature: handleCastNFT }
}

export const usePurchaseNFTSignature = () => {
  const nftSignatureFactory = useNFTSignatureFactory()

  const handlePurchase = useCallback(async (ruleId, amount)=> {
    await purchaseNFTSignature(nftSignatureFactory, ruleId, amount)
  }, [nftSignatureFactory])

  return { onPurchaseNFTSignatures: handlePurchase }
}



export const useInjectNFTSignature = () => {
  const nftSignatureFactory = useNFTSignatureFactory()

  const handleInjectNFTSignature = useCallback(async (gegoId: string, amount: string)  => {
    const res = await injectNFTSignature(nftSignatureFactory, gegoId, amount)
    return res
  }, [nftSignatureFactory])

  return { onInjectNFTSignature: handleInjectNFTSignature }
}

export default useCastNFT
