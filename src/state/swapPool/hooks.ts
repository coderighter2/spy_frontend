import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import { useWeb3React } from '@web3-react/core'
import { State } from '../types'
import { fetchSwapPoolPublicDataAsync, fetchSwapPoolUserDataAsync } from '.'


export const usePollSwapPoolData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()

  useEffect(() => {
    dispatch(fetchSwapPoolPublicDataAsync())
    if (account) {
      dispatch(fetchSwapPoolUserDataAsync({account}))
    }
  }, [dispatch, slowRefresh, account])
}

export const useTotalSaleCount = () =>  {
  return useSelector((state: State) => state.swapPool.totalSaleCount)
}
export const useUserSaleCount = () =>  {
  return useSelector((state: State) => state.swapPool.userSaleCount)
}
export const useSaleDeployFee = () =>  {
  return useSelector((state: State) => state.swapPool.fee ?? '0')
}
