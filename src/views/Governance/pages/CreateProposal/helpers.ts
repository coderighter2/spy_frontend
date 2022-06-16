import BigNumber from 'bignumber.js'
import { Decimal } from 'decimal.js'
import { isNaN, isNumber } from 'lodash'
import { BLOCKS_PER_YEAR } from 'config'
import { ContextApi } from 'contexts/Localization/types'
import { format, parseISO, isValid } from 'date-fns'
import { useMemo } from 'react'
import { useFarmFromPid, useOldFarmFromPid } from 'state/farms/hooks'
import { BIG_ONE, BIG_ZERO } from 'utils/bigNumber'
import { FormState } from './types'

export const combineDateAndTime = (date: Date, time: Date) => {
  if (!isValid(date) || !isValid(time)) {
    return null
  }

  const dateStr = format(date, 'yyyy-MM-dd')
  const timeStr = format(time, 'HH:mm:ss')

  return parseISO(`${dateStr}T${timeStr}`).getTime() / 1e3
}

export const getFormErrors = (formData: FormState, t: ContextApi['t']) => {
  const { name, body, nftRefillAmount, apyMultiplier, targetApy } = formData
  const errors: { [key: string]: string[] } = {}

  if (!name) {
    errors.name = [t('%field% is required', { field: 'Title' })]
  }

  if (!body) {
    errors.body = [t('%field% is required', { field: 'Body' })]
  }

  if (!targetApy) {
    errors.targetApy = [t('%field% is required', { field: 'Target APY' })]
  }

  if (parseInt(targetApy) < 1) {
    errors.targetApy = [t('%field% is invalid', { field: 'Target APY' })]
  }

  if (!apyMultiplier) {
    errors.apyMultiplier = [t('%field% is required', { field: 'APY Multiplier' })]
  }

  if (parseInt(apyMultiplier) < 1) {
    errors.apyMultiplier = [t('%field% is invalid', { field: 'Target APY' })]
  }

  if (!nftRefillAmount) {
    errors.nftRefillAmount = [t('%field% is required', { field: 'SPY Amount' })]
  }

  if (parseInt(nftRefillAmount) < 1) {
    errors.nftRefillAmount = [t('%field% is invalid', { field: 'SPY Amount' })]
  }

  return errors
}


export const useAPYCalcuation = (
  busdApy: string,
  bnbApy: string,
  usdcApy: string,
  multiplier = '1'
) => {
  const spyBusdFarm = useFarmFromPid(0)
  const spyBnbFarm = useFarmFromPid(1)
  const spyUsdcFarm = useFarmFromPid(4)

  return useMemo(() => {

    if (!spyBusdFarm.tokenPriceBusd || !spyBusdFarm.quoteTokenPriceBusd || !spyBnbFarm.quoteTokenPriceBusd || !spyUsdcFarm.quoteTokenPriceBusd ) {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }

    if (parseInt(busdApy) < 1 || parseInt(usdcApy) < 1 || parseInt(bnbApy) < 1) {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }
    try {
      const DECIMAL_ONE = new Decimal(1)
      const spyBusdPriceDecimal = new Decimal(spyBnbFarm.tokenPriceBusd)
      let harvestInterval = 86400 / (spyUsdcFarm.harvestInterval?.toNumber() ?? 86400)
      let totalLiquidity = new Decimal(new BigNumber(spyBusdFarm.lpTotalInQuoteToken).times(spyBusdFarm.quoteTokenPriceBusd).toString())
      const spyBusdSpyWeight = new Decimal(busdApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)
      
      harvestInterval = 86400 / (spyBnbFarm.harvestInterval?.toNumber() ?? 86400)
      totalLiquidity = new Decimal(new BigNumber(spyBnbFarm.lpTotalInQuoteToken).times(spyBnbFarm.quoteTokenPriceBusd).toString())
      const spyBnbSpyWeight = new Decimal(bnbApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)

      harvestInterval = 86400 / (spyUsdcFarm.harvestInterval?.toNumber() ?? 86400)
      totalLiquidity = new Decimal(new BigNumber(spyUsdcFarm.lpTotalInQuoteToken).times(spyUsdcFarm.quoteTokenPriceBusd).toString())
      const spyUsdcSpyWeight = new Decimal(usdcApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)
      

      const spyNeeded = spyBusdSpyWeight.plus(spyBnbSpyWeight).plus(spyUsdcSpyWeight).toNumber()

      const spyPerBlock = Math.ceil(spyNeeded).toFixed(0)
      const baseAllocPoint_ = new BigNumber(spyPerBlock).minus(spyNeeded).dividedBy(spyPerBlock).multipliedBy(100000).toFixed(0)
      const busdAllocPoint_ = spyBusdSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const bnbAllocPoint_ = spyBnbSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const usdcAllocPoint_ = spyUsdcSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const baseAllocPoint = (parseInt(baseAllocPoint_) * parseInt(multiplier)).toString()
      const busdAllocPoint = (parseInt(busdAllocPoint_) * parseInt(multiplier)).toString()
      const bnbAllocPoint = (parseInt(bnbAllocPoint_) * parseInt(multiplier)).toString()
      const usdcAllocPoint = (parseInt(usdcAllocPoint_) * parseInt(multiplier)).toString()
      return {
        spyPerBlock, 
        baseAllocPoint, 
        busdAllocPoint: busdAllocPoint === '0' ? '1' : busdAllocPoint, 
        bnbAllocPoint: bnbAllocPoint === '0' ? '1' : bnbAllocPoint, 
        usdcAllocPoint: usdcAllocPoint === '0' ? '1': usdcAllocPoint
      }
    } catch {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }
  }, [spyBusdFarm, spyBnbFarm, spyUsdcFarm, busdApy, usdcApy, bnbApy, multiplier])
}


export const useOldAPYCalcuation = (
  busdApy: string,
  bnbApy: string,
  usdcApy: string,
  multiplier = '1'
) => {
  const spyBusdFarm = useOldFarmFromPid(0)
  const spyBnbFarm = useOldFarmFromPid(1)
  const spyUsdcFarm = useOldFarmFromPid(4)

  return useMemo(() => {

    if (!spyBusdFarm.tokenPriceBusd || !spyBusdFarm.quoteTokenPriceBusd || !spyBnbFarm.quoteTokenPriceBusd || !spyUsdcFarm.quoteTokenPriceBusd ) {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }

    if (parseInt(busdApy) < 1 || parseInt(usdcApy) < 1 || parseInt(bnbApy) < 1) {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }
    try {
      const DECIMAL_ONE = new Decimal(1)
      const spyBusdPriceDecimal = new Decimal(spyBnbFarm.tokenPriceBusd)
      let harvestInterval = 86400 / (spyUsdcFarm.harvestInterval?.toNumber() ?? 86400)
      let totalLiquidity = new Decimal(new BigNumber(spyBusdFarm.lpTotalInQuoteToken).times(spyBusdFarm.quoteTokenPriceBusd).toString())
      const spyBusdSpyWeight = new Decimal(busdApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)
      
      harvestInterval = 86400 / (spyBnbFarm.harvestInterval?.toNumber() ?? 86400)
      totalLiquidity = new Decimal(new BigNumber(spyBnbFarm.lpTotalInQuoteToken).times(spyBnbFarm.quoteTokenPriceBusd).toString())
      const spyBnbSpyWeight = new Decimal(bnbApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)

      harvestInterval = 86400 / (spyUsdcFarm.harvestInterval?.toNumber() ?? 86400)
      totalLiquidity = new Decimal(new BigNumber(spyUsdcFarm.lpTotalInQuoteToken).times(spyUsdcFarm.quoteTokenPriceBusd).toString())
      const spyUsdcSpyWeight = new Decimal(usdcApy).dividedBy(100).plus(1).pow(DECIMAL_ONE.dividedBy(365 * harvestInterval)).minus(1).mul(365 * harvestInterval).dividedBy(spyBusdPriceDecimal).dividedBy(BLOCKS_PER_YEAR).mul(totalLiquidity)
      

      const spyNeeded = spyBusdSpyWeight.plus(spyBnbSpyWeight).plus(spyUsdcSpyWeight).toNumber()

      const spyPerBlock = Math.ceil(spyNeeded).toFixed(0)
      const baseAllocPoint_ = new BigNumber(spyPerBlock).minus(spyNeeded).dividedBy(spyPerBlock).multipliedBy(100000).toFixed(0)
      const busdAllocPoint_ = spyBusdSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const bnbAllocPoint_ = spyBnbSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const usdcAllocPoint_ = spyUsdcSpyWeight.dividedBy(spyPerBlock).mul(100000).toFixed(0)
      const baseAllocPoint = (parseInt(baseAllocPoint_) * parseInt(multiplier)).toString()
      const busdAllocPoint = (parseInt(busdAllocPoint_) * parseInt(multiplier)).toString()
      const bnbAllocPoint = (parseInt(bnbAllocPoint_) * parseInt(multiplier)).toString()
      const usdcAllocPoint = (parseInt(usdcAllocPoint_) * parseInt(multiplier)).toString()
      return {
        spyPerBlock, 
        baseAllocPoint, 
        busdAllocPoint: busdAllocPoint === '0' ? '1' : busdAllocPoint, 
        bnbAllocPoint: bnbAllocPoint === '0' ? '1' : bnbAllocPoint, 
        usdcAllocPoint: usdcAllocPoint === '0' ? '1': usdcAllocPoint
      }
    } catch {
      return {
        spyPerBlock: undefined,
        baseAllocPoint: undefined,
        busdAllocPoint: undefined,
        bnbAllocPoint: undefined,
        usdcAllocPoint: undefined
      }
    }
  }, [spyBusdFarm, spyBnbFarm, spyUsdcFarm, busdApy, usdcApy, bnbApy, multiplier])
}