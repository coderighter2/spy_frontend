import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import getGasPrice from 'utils/getGasPrice'
import { useSingleCallResult } from 'state/multicall/hooks'
import { callWithEstimateGas } from 'utils/calls'
import { useGovernanceContract } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import { ProposalCommand } from '../types'

const useVoteProposal = (proposalId) : [boolean, (number) => Promise<string>]=> {
  const governorContract = useGovernanceContract()
  const { account } = useWeb3React()

  const inputs = useMemo(() => [proposalId, account], [proposalId, account])
  const hasVotedResult = useSingleCallResult(governorContract, 'hasVoted', inputs).result

  const voted =  useMemo(
    () => (account && hasVotedResult ? hasVotedResult[0] : undefined),
    [hasVotedResult, account],
  )
  
  const handleVote = useCallback(async (support: number) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'castVote', [proposalId, support], {gasPrice,})
    const receipt = await tx.wait()
    return receipt.transactionHash
  }, [governorContract, proposalId])

  return [!!voted, handleVote]
}

export const useVoteWeight = (proposalId) : [boolean, boolean, BigNumber, () => Promise<string>]=> {
  const governorContract = useGovernanceContract()
  const { account } = useWeb3React()

  const inputs = useMemo(() => [proposalId, account], [proposalId, account])
  const hasCalculatedWeightResult = useSingleCallResult(governorContract, 'calculatedWeightForProposal', inputs).result
  const voteWeightResult = useSingleCallResult(governorContract, 'voteWeightForProposal', inputs).result
  const hasCalculatedWeight =  useMemo(
    () => (account && hasCalculatedWeightResult ? hasCalculatedWeightResult[0] : undefined),
    [hasCalculatedWeightResult, account],
  )

  const voteWeight =  useMemo(
    () => (account && voteWeightResult ? new BigNumber(voteWeightResult.toString()) : undefined),
    [voteWeightResult, account],
  )

  const pending = useMemo(() => {
    return !hasCalculatedWeightResult || !account
  }, [hasCalculatedWeightResult, account])
  
  const handleCalculateWeight = useCallback(async () => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'calculateWeight', [proposalId, account], {gasPrice,})
    const receipt = await tx.wait()
    return receipt.transactionHash
  }, [governorContract, proposalId, account])

  return [pending, !!hasCalculatedWeight, voteWeight, handleCalculateWeight]
}

export default useVoteProposal
