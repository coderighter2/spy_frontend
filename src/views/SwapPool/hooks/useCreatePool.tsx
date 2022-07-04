import { useCallback } from 'react'
import { useSwapPoolFactoryContract } from 'hooks/useContract'
import { ROUTER_ADDRESS } from 'config/constants'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'

interface CreateSwapPoolParams {
  title: string
  feeAmount: string
  wallet: string
  token: string
  baseToken: string
  rate: string
  rateDecimals: string
  goal: string
  cap: string
  openingTime: number
  closingTime: number
  minContribution: string
  maxContribution: string
  whitelistEnabled: boolean
  vestingInterval: number
  vestingPercent: number
}

export const useCreatePool = () => {
  const factory = useSwapPoolFactoryContract()

  const handleCreate = useCallback(
    async (params: CreateSwapPoolParams) => {
      const {title, feeAmount, wallet, token, baseToken, rate, rateDecimals, goal, cap, openingTime, closingTime, minContribution, maxContribution, whitelistEnabled, vestingInterval, vestingPercent} = params;
      const gasPrice = getGasPrice()
      const stageTimes = []
      const stagePercents = []
      let totalPercent = 0;
      let index = 1;
      while (totalPercent < 100) {
        stageTimes.push(vestingInterval * 3600 * index);
        stagePercents.push(Math.min(vestingPercent, 100 - totalPercent));
        totalPercent += vestingPercent;
        index += 1;
      }
      const args = [[rate, rateDecimals, goal, cap, minContribution, maxContribution, openingTime, closingTime, wallet, token, baseToken,  whitelistEnabled, title], stageTimes, stagePercents];
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

  return { onCreatePool: handleCreate }
}