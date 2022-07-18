import { useCallback } from 'react'
import { useSaleFactoryContract } from 'hooks/useContract'
import { ROUTER_ADDRESS } from 'config/constants'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'

interface CreateSaleParams {
  title: string
  feeAmount: string
  wallet: string
  token: string
  baseToken: string
  rate: string
  rateDecimals: string
  listingRate: string
  listingRateDecimals: string
  liquidityPercent: string
  goal: string
  cap: string
  openingTime: number
  closingTime: number
  minContribution: string
  maxContribution: string
  whitelistEnabled: boolean
  vestingInterval: number
  vestingPercent: number
  airdropAmount: string
  minVote: string
  vestingStartTime: number
}

export const useCreateSale = () => {
  const factory = useSaleFactoryContract()

  const handleCreateSale = useCallback(
    async (params: CreateSaleParams) => {
      const {title, feeAmount, wallet, token, baseToken, rate, rateDecimals, listingRate, listingRateDecimals, liquidityPercent, goal, cap, openingTime, closingTime, minContribution, maxContribution, whitelistEnabled, vestingInterval, vestingPercent, airdropAmount, minVote, vestingStartTime} = params;
      const gasPrice = getGasPrice()
      const stageTimes = []
      const stagePercents = []
      let totalPercent = 0;
      let index = 0;
      while (totalPercent < 100) {
        stageTimes.push(vestingInterval * 3600 * index);
        stagePercents.push(Math.min(vestingPercent, 100 - totalPercent));
        totalPercent += vestingPercent;
        index += 1;
      }
      const args = [[rate, rateDecimals, listingRate, listingRateDecimals, liquidityPercent, goal, cap, minContribution, maxContribution, openingTime, closingTime, wallet, ROUTER_ADDRESS, token, baseToken,  whitelistEnabled, title], [airdropAmount, minVote, tokens.spy.address], stageTimes, stagePercents, vestingStartTime];
      const tx = await callWithEstimateGas(factory, 'createSale', args, { gasPrice}, 1000, feeAmount)
      const receipt = await tx.wait()
      if (receipt.status === 1) {
        /* eslint-disable dot-notation */
        const ev = Array.from(receipt["events"]).filter((v) =>  {
          return v["event"] === "NewSaleCreated"
        }); 

        if (ev.length > 0) {
          const resArgs = ev[0]["args"];

          return resArgs['deployed'];
        }
        /* eslint-enable dot-notation */
      }
      return null
    },
    [factory],
  )

  return { onCreateSale: handleCreateSale }
}