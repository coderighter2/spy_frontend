import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useGovernanceContract } from 'hooks/useContract'
import { AddressZero } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'
import { useSingleCallResult } from 'state/multicall/hooks'
import multicall, { multicallv2 } from 'utils/multicall'
import spyGovernorAbi from 'config/abi/spyGovernor.json'
import { getGovernanceAddress } from 'utils/addressHelpers'
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
          address: getGovernanceAddress(),
          name: 'proposals',
          params: [id],
        },
        {
          address: getGovernanceAddress(),
          name: 'state',
          params: [id],
        },
        {
          address: getGovernanceAddress(),
          name: 'proposalEta',
          params: [id],
        }
      ]

      const [{
        proposer,
        startBlock: startBlock_,
        endBlock: endBlock_,
        forVotes: forVotes_,
        againstVotes: againstVotes_,
        abstainVotes: abstainVotes_,
        executed,
        canceled
      }, [state], [proposalEta]] = await multicallv2(spyGovernorAbi, calls)

      if (proposer === AddressZero) {
        return null
      }

      return {
        proposalId: id,
        proposer,
        startBlock: new BigNumber(startBlock_._hex).toNumber(),
        endBlock: new BigNumber(endBlock_._hex).toNumber(),
        forVotes: new BigNumber(forVotes_._hex),
        againstVotes: new BigNumber(againstVotes_._hex),
        abstainVotes: new BigNumber(abstainVotes_._hex),
        executed,
        canceled,
        state,
        eta: new BigNumber(proposalEta._hex).toNumber(),
      }

    } catch {
      return null
    }
  }, [])

  return { onGetProposal: handleGetProposal }
}


export const useProposalAdmin = () : [boolean, boolean]=> {
  const governorContract = useGovernanceContract()
  const { account } = useWeb3React()

  const inputs = useMemo(() => [account], [account])
  const isProposalAdminResult = useSingleCallResult(governorContract, 'proposers', inputs).result
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
