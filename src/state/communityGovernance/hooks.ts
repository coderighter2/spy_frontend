import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { fetchGovernancePublicDataAsync,  } from '.'
import { State, DeserializedGovernanceState, SerializedGovernance, DeserializedGovernance } from '../types'

const deserializeGovernance = (governance: SerializedGovernance): DeserializedGovernance => {
  const { dev, delay } = governance

  return {
    dev,
    quorum: '0',
    delay
  }
}

export const usePollCommunityGovernancePublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    dispatch(fetchGovernancePublicDataAsync())
  }, [dispatch, slowRefresh])
}

export const useCommunityGovernance = (): DeserializedGovernanceState => {
  const governance = useSelector((state: State) => state.communityGovernance)
  const { loadArchivedData } = governance
  return {
    loadArchivedData,
    data: deserializeGovernance(governance.data)
  }
}

export const useCommunityGovernanceDevAddress = (): string => {
  const governanceData = useSelector((state: State) => state.communityGovernance.data)
  return governanceData.dev
}
