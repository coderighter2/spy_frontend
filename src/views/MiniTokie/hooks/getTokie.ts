import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useGovernanceContract, useTokenContract } from 'hooks/useContract'
import { AddressZero } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'
import { useSingleCallResult } from 'state/multicall/hooks'
import tokens from 'config/constants/tokens'
import { multicallv2 } from 'utils/multicall'
import minitokieAbi from 'config/abi/minitokie.json'


export interface MiniTokieInfo {
  owner: string
  burnFee: number
  buybackFee: number
  liquidityFee: number
  marketingFee: number
  antiBot: string
  antiBotEnabled: boolean
  buybackFeeTotal: BigNumber
  buybackWallet: string
  feeEnabled: boolean
  liquidityFeeTotal: BigNumber
  marketingWallet: string
  numTokensSellToAddToLiquidity: BigNumber
  uniswapV2Pair: string
}

export const useGetMiniTokieInfo = () => {
  const handleGet = useCallback(async () : Promise<MiniTokieInfo> => {
    try {

      const tokenAddress = tokens.minitokie.address

      const calls = [
        {
          address: tokenAddress,
          name: 'owner',
          params: [],
        },
        {
          address: tokenAddress,
          name: '_burnFee',
          params: [],
        },
        {
          address: tokenAddress,
          name: '_buybackFee',
          params: [],
        },
        {
          address: tokenAddress,
          name: '_liquidityFee',
          params: [],
        },
        {
          address: tokenAddress,
          name: '_marketingFee',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'antiBot',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'antiBotEnabled',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'buybackFeeTotal',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'buybackWallet',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'feeEnabled',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'liquidityFeeTotal',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'marketingWallet',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'numTokensSellToAddToLiquidity',
          params: [],
        },
        {
          address: tokenAddress,
          name: 'uniswapV2Pair',
          params: [],
        }
      ]

      const [
        [owner],
        [burnFee],
        [buybackFee],
        [liquidityFee],
        [marketingFee],
        [antiBot],
        [antiBotEnabled],
        [buybackFeeTotal],
        [buybackWallet],
        [feeEnabled],
        [liquidityFeeTotal],
        [marketingWallet],
        [numTokensSellToAddToLiquidity],
        [uniswapV2Pair]
      ] = await multicallv2(minitokieAbi, calls)

      return {
        owner,
        burnFee: new BigNumber(burnFee._hex).toNumber() / 10,
        buybackFee: new BigNumber(buybackFee._hex).toNumber() / 10,
        liquidityFee: new BigNumber(liquidityFee._hex).toNumber() / 10,
        marketingFee: new BigNumber(marketingFee._hex).toNumber() / 10,
        antiBot,
        antiBotEnabled,
        buybackFeeTotal: new BigNumber(buybackFeeTotal._hex),
        buybackWallet,
        feeEnabled,
        liquidityFeeTotal: new BigNumber(liquidityFeeTotal._hex),
        marketingWallet,
        numTokensSellToAddToLiquidity: new BigNumber(numTokensSellToAddToLiquidity._hex),
        uniswapV2Pair
      }

    } catch {
      return null
    }
  }, [])
  return {onGetInfo: handleGet}
}

