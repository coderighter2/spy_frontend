import BigNumber from 'bignumber.js'
import saleFactoryABI from 'config/abi/saleFactory.json'
import { getSaleFactoryAddress } from 'utils/addressHelpers'
import { getSaleFactoryContract } from 'utils/contractHelpers'
import multicall from 'utils/multicall'

export interface PublicLaunchpadUserData {
  userSaleCount?: number
}

export interface PublicLaunchpadData {
  totalSaleCount?: number
  fee?: SerializedBigNumber
}

export const fetchLaunchpadUserData = async (account: string): Promise<PublicLaunchpadUserData> => {

    const launchpadContract = getSaleFactoryContract()

    const _userSaleCount = await launchpadContract.totalSaleCountForUser(account)
    const userSaleCount= new BigNumber(_userSaleCount._hex).toNumber()
    return { userSaleCount }
}

export const fetchLaunchpadPublicData = async (): Promise<PublicLaunchpadData> => {

  const launchpadAddress = getSaleFactoryAddress()

  const calls = [
      {
        address: launchpadAddress,
        name: 'getTotalSaleCount',
        params: [],
      },
      {
        address: launchpadAddress,
        name: 'deployFee',
        params: [],
      }
  ];

  const [[_totalSaleCount], [_fee]] = await multicall(saleFactoryABI, calls)

  const totalSaleCount = _totalSaleCount ? new BigNumber(_totalSaleCount._hex).toNumber() : 0
  const fee = _fee ? new BigNumber(_fee._hex).toJSON() : '0'

  return {
    totalSaleCount,
    fee
  }
}