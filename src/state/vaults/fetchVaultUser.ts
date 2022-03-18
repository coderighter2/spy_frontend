import BigNumber from 'bignumber.js'
import erc20ABI from 'config/abi/erc20.json'
import baseVaultABI from 'config/abi/baseVault.json'
import multicall, { multicallv2 } from 'utils/multicall'
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
    accum.push({
      address: contractAddress,
      name: 'earned',
      params: [account],
    })
    return accum
  }, [])

  console.log('here')
  const res1 = await multicallv2(erc20ABI, calls1, {requireSuccess:false})
  console.log('here1')
  const res2 = await multicallv2(baseVaultABI, calls2, {requireSuccess:false})
  console.log('here2')

  const ercResponses = res1.reduce((accum: any[][], item, index) => {
    const chunkIdx = Math.floor(index / 3)
    const chunks = accum
    const chunk = chunks[chunkIdx] ?? []
    chunk.push(item)
    chunks[chunkIdx] = chunk
    return chunks
  }, [])

  const vaultResponses = res2.reduce((accum: any[][], item, index) => {
    const chunkIdx = Math.floor(index / 4)
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
      pendingEarnings: new BigNumber(vaultResponses[index][2]).toJSON(),
      earnings: new BigNumber(vaultResponses[index][3]).toJSON(),
    }
  })
}
