import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import { vaultsConfig } from 'config/constants'
import useRefresh from 'hooks/useRefresh'
import { deserializeToken } from 'state/user/hooks/helpers'
import { fetchVaultsPublicDataAsync, fetchVaultUserDataAsync } from '.'
import { State, SerializedVault, DeserializedVaultUserData, DeserializedVault, DeserializedVaultsState } from '../types'

const deserializeVaultUserData = (vault: SerializedVault): DeserializedVaultUserData => {
  return {
    tokenBalance: vault.userData ? new BigNumber(vault.userData.tokenBalance) : BIG_ZERO,
    stakedBalance: vault.userData ? new BigNumber(vault.userData.stakedBalance) : BIG_ZERO,
    earnings: vault.userData ? new BigNumber(vault.userData.earnings) : BIG_ZERO,
  }
}

const deserializeVault = (vault: SerializedVault): DeserializedVault => {
  const { lpAddresses, symbol, lpSymbol, pid, contractAddresses, isETH, nearestCompoundingTime } = vault

  return {
    lpAddresses,
    contractAddresses,
    isETH,
    symbol,
    lpSymbol,
    pid,
    token: deserializeToken(vault.token),
    userData: deserializeVaultUserData(vault),
    totalSupply: vault.totalSupply ? new BigNumber(vault.totalSupply) : BIG_ZERO,
    totalPoolPendingRewards: vault.totalPoolPendingRewards ? new BigNumber(vault.totalPoolPendingRewards) : BIG_ZERO,
    totalPoolAmount: vault.totalPoolAmount ? new BigNumber(vault.totalPoolAmount) : BIG_ZERO,
    nearestCompoundingTime: vault.nearestCompoundingTime ? new BigNumber(vault.nearestCompoundingTime) : BIG_ZERO,
    rewardForCompounder: vault.rewardForCompounder ? new BigNumber(vault.rewardForCompounder) : BIG_ZERO 
  }
}

export const usePollVaultsPublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const pids = vaultsConfig.map((vaultToFetch) => vaultToFetch.pid)

    dispatch(fetchVaultsPublicDataAsync(pids))
  }, [dispatch, slowRefresh])
}

export const usePollVaultsWithUserData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()

  useEffect(() => {
    const pids = vaultsConfig.map((vaultToFetch) => vaultToFetch.pid)

    dispatch(fetchVaultsPublicDataAsync(pids))

    if (account) {
      dispatch(fetchVaultUserDataAsync({ account, pids }))
    }
  }, [dispatch, slowRefresh, account])
}

/**
 * Fetches the "core" vault data used globally
 * 1 = SPY-BNB LP
 * 3 = BUSD-BNB LP
 */
export const usePollCoreVaultData = () => {
  const dispatch = useAppDispatch()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    dispatch(fetchVaultsPublicDataAsync([0, 3]))
  }, [dispatch, fastRefresh])
}

export const useVaults = (): DeserializedVaultsState => {
  const vaults = useSelector((state: State) => state.vaults)
  const deserializedVaultsData = vaults.data.map(deserializeVault)
  const { loadArchivedVaultsData, userDataLoaded } = vaults
  return {
    loadArchivedVaultsData,
    userDataLoaded,
    data: deserializedVaultsData,
  }
}

export const useVaultFromPid = (pid: number): DeserializedVault => {
  const vault = useSelector((state: State) => state.vaults.data.find((f) => f.pid === pid))
  return deserializeVault(vault)
}

export const useVaultFromSymbol = (symbol: string): DeserializedVault => {
  const vault = useSelector((state: State) => state.vaults.data.find((f) => f.symbol === symbol))
  return deserializeVault(vault)
}

export const useVaultFromLpSymbol = (symbol: string): DeserializedVault => {
  const vault = useSelector((state: State) => state.vaults.data.find((f) => f.lpSymbol === symbol))
  return deserializeVault(vault)
}

export const useVaultUser = (pid): DeserializedVaultUserData => {
  const { userData } = useVaultFromPid(pid)
  const { tokenBalance, stakedBalance, earnings } = userData
  return {
    tokenBalance,
    stakedBalance,
    earnings
  }
}

// Return the base token price for a vault, from a given pid
export const useBusdPriceFromPid = (pid: number): BigNumber => {
  const vault = useVaultFromPid(pid)
  return vault && new BigNumber(vault.farm.tokenPriceBusd)
}

export const getLpTokenPrice = (vault: DeserializedVault) => {
  const vaultTokenPriceInUsd = new BigNumber(vault.farm.tokenPriceBusd)
  let lpTokenPrice = BIG_ZERO

  if (vault.farm.lpTotalSupply.gt(0) && vault.farm.lpTotalInQuoteToken.gt(0)) {
    // Total value of base token in LP
    const valueOfBaseTokenInVault = vaultTokenPriceInUsd.times(vault.farm.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInVault = valueOfBaseTokenInVault.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(vault.farm.lpTotalSupply)
    lpTokenPrice = overallValueOfAllTokensInVault.div(totalLpTokens)
  }

  return lpTokenPrice
}

export const useLpTokenPrice = (symbol: string) => {
  const vault = useVaultFromLpSymbol(symbol)
  const vaultTokenPriceInUsd = useBusdPriceFromPid(vault.pid)
  let lpTokenPrice = BIG_ZERO

  if (vault.farm.lpTotalSupply.gt(0) && vault.farm.lpTotalInQuoteToken.gt(0)) {
    // Total value of base token in LP
    const valueOfBaseTokenInVault = vaultTokenPriceInUsd.times(vault.farm.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInVault = valueOfBaseTokenInVault.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(vault.farm.lpTotalSupply)
    lpTokenPrice = overallValueOfAllTokensInVault.div(totalLpTokens)
  }

  return lpTokenPrice
}

// /!\ Deprecated , use the BUSD hook in /hooks

export const usePriceCakeBusd = (): BigNumber => {
  const cakeBnbVault = useVaultFromPid(1)

  const cakePriceBusdAsString = cakeBnbVault.farm.tokenPriceBusd

  const cakePriceBusd = useMemo(() => {
    return new BigNumber(cakePriceBusdAsString)
  }, [cakePriceBusdAsString])

  return cakePriceBusd
}
