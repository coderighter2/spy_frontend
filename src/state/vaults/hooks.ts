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
import { fetchOldVaultsPublicDataAsync, fetchOldVaultUserDataAsync, fetchVaultsPublicDataAsync, fetchVaultUserDataAsync } from '.'
import { State, SerializedVault, DeserializedVaultUserData, DeserializedVault, DeserializedVaultsState } from '../types'

const deserializeVaultUserData = (vault: SerializedVault): DeserializedVaultUserData => {
  return {
    tokenAllowance: vault.userData ? new BigNumber(vault.userData.tokenAllowance) : BIG_ZERO,
    lpAllowance: vault.userData ? new BigNumber(vault.userData.lpAllowance) : BIG_ZERO,
    lpTokenBalance: vault.userData ? new BigNumber(vault.userData.lpTokenBalance) : BIG_ZERO,
    tokenBalanceInVault: vault.userData ? new BigNumber(vault.userData.tokenBalanceInVault) : BIG_ZERO,
    stakedBalance: vault.userData ? new BigNumber(vault.userData.stakedBalance) : BIG_ZERO,
    earnings: vault.userData ? new BigNumber(vault.userData.earnings) : BIG_ZERO,
    pendingEarnings: vault.userData ? new BigNumber(vault.userData.pendingEarnings) : BIG_ZERO,
  }
}

const deserializeVault = (vault: SerializedVault): DeserializedVault => {
  const { lpAddresses, symbol, lpSymbol, pid, contractAddresses, isETH, nearestCompoundingTime, isOld } = vault

  return {
    isOld,
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
    dispatch(fetchOldVaultsPublicDataAsync(pids))
  }, [dispatch, slowRefresh])
}

export const usePollVaultsWithUserData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()

  useEffect(() => {
    const pids = vaultsConfig.map((vaultToFetch) => vaultToFetch.pid)

    dispatch(fetchVaultsPublicDataAsync(pids))
    dispatch(fetchOldVaultsPublicDataAsync(pids))

    if (account) {
      dispatch(fetchVaultUserDataAsync({ account, pids }))
      dispatch(fetchOldVaultUserDataAsync({ account, pids }))
    }
  }, [dispatch, slowRefresh, account])
}

export const useVaults = (): DeserializedVaultsState => {
  const vaults = useSelector((state: State) => state.vaults)
  const deserializedVaultsData = vaults.data.map(deserializeVault)
  const deserializedOldVaultsData = vaults.old.map(deserializeVault)
  const { loadArchivedVaultsData, userDataLoaded, oldUserDataLoaded } = vaults
  return {
    loadArchivedVaultsData,
    userDataLoaded,
    oldUserDataLoaded,
    data: deserializedVaultsData,
    old: deserializedOldVaultsData
  }
}

export const useVaultFromPid = (pid: number): DeserializedVault => {
  const vault = useSelector((state: State) => state.vaults.data.find((f) => f.pid === pid))
  return deserializeVault(vault)
}

export const useVaultsFromPid = (pid: number) => {
  const vault = useSelector((state: State) => state.vaults.data.find((f) => f.pid === pid))
  const oldVault = useSelector((state: State) => state.vaults.old.find((f) => f.pid === pid))
  return {
    vault: deserializeVault(vault),
    old: deserializeVault(oldVault)
  }
}

export const useOldVaultFromPid = (pid: number): DeserializedVault => {
  const vault = useSelector((state: State) => state.vaults.old.find((f) => f.pid === pid))
  return deserializeVault(vault)
}

export const useVaultUser = (pid, isOld = false): DeserializedVaultUserData => {
  const { vault, old } = useVaultsFromPid(pid)
  const { tokenAllowance, lpAllowance, lpTokenBalance, tokenBalanceInVault, stakedBalance, earnings, pendingEarnings } = isOld ? old.userData : vault.userData
  return {
    tokenAllowance,
    lpAllowance,
    lpTokenBalance,
    tokenBalanceInVault,
    stakedBalance,
    earnings,
    pendingEarnings
  }
}

export const useOldVaultUser = (pid): DeserializedVaultUserData => {
  const { userData } = useOldVaultFromPid(pid)
  const { tokenAllowance, lpAllowance, lpTokenBalance, tokenBalanceInVault, stakedBalance, earnings, pendingEarnings } = userData
  return {
    tokenAllowance,
    lpAllowance,
    lpTokenBalance,
    tokenBalanceInVault,
    stakedBalance,
    earnings,
    pendingEarnings
  }
}