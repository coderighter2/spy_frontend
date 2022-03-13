import BigNumber from 'bignumber.js'
import erc20ABI from 'config/abi/erc20.json'
import baseVaultABI from 'config/abi/baseVault.json'
import multicall from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
import { SerializedVaultConfig } from 'config/constants/types'



export const fetchVaultUserTokenBalances = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
  const calls = vaultsToFetch.map((vault) => {
    const lpContractAddress = getAddress(vault.lpAddresses)
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    }
  })

  const rawTokenBalances = await multicall(erc20ABI, calls)
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
    return new BigNumber(tokenBalance).toJSON()
  })
  return parsedTokenBalances
}

export const fetchVaultUserInfos = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {

  const calls = vaultsToFetch.map((vault) => {
    return {
      address: getAddress(vault.contractAddresses),
      name: 'userInfo',
      params: [account],
    }
  })

  const rawStakedBalances = await multicall(baseVaultABI, calls)
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
    return new BigNumber(stakedBalance[0]._hex).toJSON()
  })
  return [parsedStakedBalances]
}

export const fetchVaultUserEarnings = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {

  const calls = vaultsToFetch.map((vault) => {
    return {
      address: getAddress(vault.contractAddresses),
      name: 'pendingEarned',
      params: [account],
    }
  })

  const rawEarnings = await multicall(baseVaultABI, calls)
  const parsedEarnings = rawEarnings.map((earnings) => {
    return new BigNumber(earnings).toJSON()
  })
  return parsedEarnings
}