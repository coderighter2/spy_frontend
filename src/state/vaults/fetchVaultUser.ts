import BigNumber from 'bignumber.js'
import erc20ABI from 'config/abi/erc20.json'
import baseVaultABI from 'config/abi/baseVault.json'
import multicall from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
import { SerializedVaultConfig } from 'config/constants/types'

export const fetchVaultUserDatas = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
  const calls1 = vaultsToFetch.reduce((accum, vault, index) => {
    const contractAddress = getAddress(vault.contractAddresses)
    const lpContractAddress = getAddress(vault.lpAddresses)
    accum.push({ address: vault.token.address, name: 'allowance', params: [account, contractAddress] })
    accum.push({ address: lpContractAddress, name: 'allowance', params: [account, contractAddress] })
    accum.push({
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    })
    return accum
  }, [])

  const calls2 = vaultsToFetch.reduce((accum, vault, index) => {
    const contractAddress = getAddress(vault.contractAddresses)
    accum.push({
      address: contractAddress,
      name: 'balanceOf',
      params: [account],
    })
    accum.push({
      address: contractAddress,
      name: 'userInfo',
      params: [account],
    })
    accum.push({
      address: contractAddress,
      name: 'pendingEarned',
      params: [account],
    })
    return accum
  }, [])

  const res1 = await multicall(erc20ABI, calls1)
  const res2 = await multicall(baseVaultABI, calls2)

  const ercResponses = res1.reduce((accum: any[][], item, index) => {
    const chunkIdx = Math.floor(index / 3)
    const chunks = accum
    const chunk = chunks[chunkIdx] ?? []
    chunk.push(item)
    chunks[chunkIdx] = chunk
    return chunks
  }, [])

  const vaultResponses = res2.reduce((accum: any[][], item, index) => {
    const chunkIdx = Math.floor(index / 3)
    const chunks = accum
    const chunk = chunks[chunkIdx] ?? []
    chunk.push(item)
    chunks[chunkIdx] = chunk
    return chunks
  }, [])

  return ercResponses.map ((ercRes, index) => {
    return {
      tokenAllowance: new BigNumber(ercRes[0]).toJSON(),
      lpAllowance: new BigNumber(ercRes[1]).toJSON(),
      lpTokenBalance:new BigNumber(ercRes[2]).toJSON(),
      tokenBalanceInVault:new BigNumber(vaultResponses[index][0]).toJSON(),
      stakedBalance:new BigNumber(vaultResponses[index][1][0]._hex).toJSON(),
      earnings: new BigNumber(vaultResponses[index][2]).toJSON(),
    }
  })
}

export const fetchVaultUserAllowances = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
  const calls = vaultsToFetch.map((vault) => {
    const contractAddress = getAddress(vault.contractAddresses)
    return { address: vault.token.address, name: 'allowance', params: [account, contractAddress] }
  })

  const rawTokenAllowances = await multicall(erc20ABI, calls)
  const parsedTokenAllowances = rawTokenAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON()
  })
  return parsedTokenAllowances
}
export const fetchVaultUserLPAllowances = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
  const calls = vaultsToFetch.map((vault) => {
    const contractAddress = getAddress(vault.contractAddresses)
    const lpAddress = getAddress(vault.lpAddresses)
    return { address: lpAddress, name: 'allowance', params: [account, contractAddress] }
  })

  const rawTokenAllowances = await multicall(erc20ABI, calls)
  const parsedTokenAllowances = rawTokenAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON()
  })
  return parsedTokenAllowances
}

export const fetchVaultUserLPTokenBalances = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
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

export const fetchVaultUserTokenBalances = async (account: string, vaultsToFetch: SerializedVaultConfig[]) => {
  const calls = vaultsToFetch.map((vault) => {
    const contractAddress = getAddress(vault.contractAddresses)
    return {
      address: contractAddress,
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