import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { getAdminAddress, getNFTFactoryAddress } from 'utils/addressHelpers'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useAdminContract, useGovernanceContract } from 'hooks/useContract'
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

export const useInstantExecuteProposal = (account) => {
  const adminContract = useAdminContract()
  
  const handleExecute = useCallback(async (params: CreateProposalParams) => {

    const {command, spyPerBlock, baseAllocPoint, pids, allocPoints, nftRefillAmount, title, description} = params;

    console.log('command', command, adminContract.address)

    const gasPrice = getGasPrice()
    if (command === ProposalCommand.ADJUST_FARM_APY) {
      const tx = await callWithEstimateGas(
        adminContract, 
        'adjustMasterchefApy', 
        [spyPerBlock, baseAllocPoint, pids, allocPoints], 
        {gasPrice}, 
        1000, 
        0, 
        account)
      const receipt = await tx.wait();
      return receipt.transactionHash
    }

    const tx = await callWithEstimateGas(adminContract, 'notifyNftReward', [nftRefillAmount], {gasPrice}, 1000, 0, account)
    const receipt = await tx.wait();
    return receipt.transactionHash
  }, [adminContract, account])

  return { onInstantExecuteProposal: handleExecute }
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
