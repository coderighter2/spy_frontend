import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { getAdminAddress, getNFTFactoryAddress } from 'utils/addressHelpers'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useAdminContract, useCommunityGovernanceContract } from 'hooks/useContract'
import { getAdminContract } from 'utils/contractHelpers'
import { ProposalCommand } from '../types'

export interface CreateProposalParams {
  title: string
  description: string
  duration: number
  executionDuration: number
}

const useCreateProposal = () => {
  const governorContract = useCommunityGovernanceContract()
  
  const handleCreateProposal = useCallback(async (params: CreateProposalParams) => {

    const {duration, executionDuration, title, description} = params;

    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'propose', [
      duration,
      executionDuration,
      `${title}:::${description}`
    ], {gasPrice,})
    const receipt = await tx.wait()

    if (receipt.status === 1) {
      /* eslint-disable dot-notation */
      const ev = Array.from(receipt["events"]).filter((v) =>  {
          return v["event"] === "ProposalCreated"
      });

      if (ev.length > 0) {
          const args = ev[0]["args"];
          return new BigNumber(args["proposalId"]._hex).toJSON()
      }
      /* eslint-enable dot-notation */
  }
  return null
    return receipt.status
  }, [governorContract])

  return { onCreateProposal: handleCreateProposal }
}

export default useCreateProposal
