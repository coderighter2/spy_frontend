import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useCommunityGovernanceContract } from 'hooks/useContract'
import { AddressZero } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'
import { useSingleCallResult } from 'state/multicall/hooks'
import multicall, { multicallv2 } from 'utils/multicall'
import spyCommunityGovernorAbi from 'config/abi/spyCommunityGovernor.json'
import { getCommunityGovernanceAddress } from 'utils/addressHelpers'
import { Proposal, ProposalCommand } from '../types'

export interface CreateProposalParams {
  command: ProposalCommand
  title: string
  description: string

  spyPerBlock?: string
  baseAllocPoint?: string
  pids?: string[]
  allocPoints?: string[]
}

const useGetProposal = () => {
  
  const handleGetProposal = useCallback(async (id: string) : Promise<Proposal> => {
    try {

      const calls = [
        {
          address: getCommunityGovernanceAddress(),
          name: 'proposals',
          params: [id],
        },
        {
          address: getCommunityGovernanceAddress(),
          name: 'state',
          params: [id],
        },
      ]

      const [{
        proposer,
        startTime: startTime_,
        endTime: endTime_,
        expiringTime: expiringTime_,
        forVotes: forVotes_,
        againstVotes: againstVotes_,
        abstainVotes: abstainVotes_,
        executed,
        canceled
      }, [state]] = await multicallv2(spyCommunityGovernorAbi, calls)

      if (proposer === AddressZero) {
        return null
      }

      return {
        proposalId: id,
        proposer,
        startTime: new BigNumber(startTime_._hex).toNumber(),
        endTime: new BigNumber(endTime_._hex).toNumber(),
        expiringTime: new BigNumber(expiringTime_._hex).toNumber(),
        forVotes: new BigNumber(forVotes_._hex),
        againstVotes: new BigNumber(againstVotes_._hex),
        abstainVotes: new BigNumber(abstainVotes_._hex),
        executed,
        canceled,
        state
      }

    } catch {
      return null
    }
  }, [])

  return { onGetProposal: handleGetProposal }
}


export const useProposalAdmin = () : [boolean, boolean]=> {
  const governorContract = useCommunityGovernanceContract()
  const { account } = useWeb3React()

  const inputs = useMemo(() => [account], [account])
  const isProposalAdminResult = useSingleCallResult(governorContract, 'executors', inputs).result
  const isProposalAdmin =  useMemo(
    () => (account && isProposalAdminResult ? isProposalAdminResult[0] : undefined),
    [isProposalAdminResult, account],
  )

  const pending = useMemo(() => {
    return !isProposalAdminResult || !account
  }, [isProposalAdminResult, account])

  return [pending, isProposalAdmin]
}

export default useGetProposal
