import BigNumber from 'bignumber.js'
import baseVaultABI from 'config/abi/baseVault.json'
import { getAddress } from 'utils/addressHelpers'
import multicall, { multicallv2 } from 'utils/multicall'
import { SerializedBigNumber, SerializedVault } from '../types'

type PublicVaultData = {
  totalSupply: SerializedBigNumber
  totalPoolPendingRewards: SerializedBigNumber
  totalPoolAmount: SerializedBigNumber
  nearestCompoundingTime: SerializedBigNumber
  rewardForCompounder: SerializedBigNumber
}

const fetchPublicVaultData = async (vault: SerializedVault): Promise<PublicVaultData> => {
  const { contractAddresses } = vault
  const contractAddres = getAddress(contractAddresses)


  const [totalSupply, totalPoolAmount, totalPoolPendingRewards, nearestCompoundingTime, rewardForCompounder] = await multicall(baseVaultABI, [
    {
      address: contractAddres,
      name: 'totalSupply'
    },
    {
      address: contractAddres,
      name: 'totalPoolAmount'
    },
    {
      address: contractAddres,
      name: 'totalPoolPendingRewards'
    },
    {
      address: contractAddres,
      name: 'nearestCompoundingTime'
    },
    {
      address: contractAddres,
      name: 'rewardForCompounder'
    }
  ])

  return {
    totalSupply: new BigNumber(totalSupply).toJSON(),
    totalPoolPendingRewards: new BigNumber(totalPoolPendingRewards).toJSON(),
    totalPoolAmount: new BigNumber(totalPoolAmount).toJSON(),
    nearestCompoundingTime: new BigNumber(nearestCompoundingTime).toJSON(),
    rewardForCompounder: new BigNumber(rewardForCompounder).toJSON(),
  }
}

export default fetchPublicVaultData