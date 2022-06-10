import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { State } from '../types'
import { fetchLaunchpadPublicDataAsync, fetchLaunchpadUserDataAsync } from '.'


export const usePollLaunchpadData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()

  useEffect(() => {
    dispatch(fetchLaunchpadPublicDataAsync())
    if (account) {
      dispatch(fetchLaunchpadUserDataAsync({account}))
    }
  }, [dispatch, slowRefresh, account])
}

export const useTotalSaleCount = () =>  {
  return useSelector((state: State) => state.launchpad.totalSaleCount)
}
export const useUserSaleCount = () =>  {
  return useSelector((state: State) => state.launchpad.userSaleCount)
}
export const useSaleDeployFee = () =>  {
  return useSelector((state: State) => state.launchpad.fee ?? '0')
}
export const useSaleMinVote = () =>  {
  return useSelector((state: State) => state.launchpad.minVote ?? '100')
}
export const useSaleMinAirdrop = () =>  {
  const minAirdropAmount = useSelector((state: State) => state.launchpad.minAirdropAmount)
  return minAirdropAmount ? new BigNumber(minAirdropAmount) : new BigNumber(10000)
}
