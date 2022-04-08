import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { fetchGovernancePublicDataAsync,  } from '.'
import { State, DeserializedGovernanceState, SerializedGovernance, DeserializedGovernance } from '../types'

const deserializeGovernance = (governance: SerializedGovernance): DeserializedGovernance => {
  const { dev, quorum, delay, period } = governance

  return {
    dev,
    quorum,
    delay,
    period
  }
}

export const usePollGovernancePublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    dispatch(fetchGovernancePublicDataAsync())
  }, [dispatch, slowRefresh])
}

export const useGovernance = (): DeserializedGovernanceState => {
  const governance = useSelector((state: State) => state.governance)
  const { loadArchivedData } = governance
  return {
    loadArchivedData,
    data: deserializeGovernance(governance.data)
  }
}

export const useGovernanceDevAddress = (): string => {
  const governanceData = useSelector((state: State) => state.governance.data)
  return governanceData.dev
}

export const useGovernanceQuorum = (): BigNumber => {
  const governanceData = useSelector((state: State) => state.governance.data)
  return governanceData.quorum ? new BigNumber(governanceData.quorum) : BIG_ZERO
}