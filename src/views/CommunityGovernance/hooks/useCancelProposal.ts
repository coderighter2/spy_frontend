import { useCallback } from 'react'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useCommunityGovernanceContract } from 'hooks/useContract'


const useCancelProposal = () => {
  const governorContract = useCommunityGovernanceContract()
  
  const handleCreateProposal = useCallback(async (proposalId: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'cancel', [proposalId], {gasPrice,})
    const receipt = await tx.wait()
    return receipt.transactionHash
  }, [governorContract])

  return { onCancelProposal: handleCreateProposal }
}

export default useCancelProposal
