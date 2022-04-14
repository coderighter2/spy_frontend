import { useCallback } from 'react'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useGovernanceContract } from 'hooks/useContract'

const useQueueProposal = () => {
  const governorContract = useGovernanceContract()
  
  const handleQueueProposal = useCallback(async (proposalId: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'queue(uint256)', [proposalId], {gasPrice,})
    const receipt = await tx.wait()
    return receipt.transactionHash
  }, [governorContract])

  return { onQueueProposal: handleQueueProposal }
}

export default useQueueProposal
