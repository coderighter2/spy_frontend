import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { getAdminAddress, getNFTFactoryAddress } from 'utils/addressHelpers'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useGovernanceContract } from 'hooks/useContract'
import { getAdminContract } from 'utils/contractHelpers'
import { ProposalCommand } from '../types'

export interface CreateProposalParams {
  command: ProposalCommand
  title: string
  description: string

  nftRefillAmount?: string

  spyPerBlock?: string
  baseAllocPoint?: string
  pids?: string[]
  allocPoints?: string[]
}

const useCreateProposal = () => {
  const adminContract = getAdminContract()
  const adminContractAddress = getAdminAddress()
  const governorContract = useGovernanceContract()
  
  const handleCreateProposal = useCallback(async (params: CreateProposalParams) => {

    const {command, spyPerBlock, baseAllocPoint, pids, allocPoints, nftRefillAmount, title, description} = params;

    let callData: string
    if (command === ProposalCommand.ADJUST_FARM_APY) {
      callData = adminContract.interface.encodeFunctionData('adjustMasterchefApy', [spyPerBlock, baseAllocPoint, pids, allocPoints])
    } else {
      callData = adminContract.interface.encodeFunctionData('notifyNftReward', [nftRefillAmount])
    }
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'propose(address[],uint256[],bytes[],string)', [
      [adminContractAddress],
      [0],
      [callData],
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
  }, [governorContract, adminContract, adminContractAddress])

  return { onCreateProposal: handleCreateProposal }
}

export default useCreateProposal
