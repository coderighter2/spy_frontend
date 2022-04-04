import { useCallback } from 'react'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls'
import { useGovernanceContract } from 'hooks/useContract'

const useExecuteProposal = () => {
  const governorContract = useGovernanceContract()
  
  const handleExecuteProposal = useCallback(async (proposalId: string) => {
    const gasPrice = getGasPrice()
    const tx = await callWithEstimateGas(governorContract, 'execute(uint256)', [proposalId], {gasPrice,})
    const receipt = await tx.wait()
    return receipt.transactionHash
  }, [governorContract])

  return { onExecuteProposal: handleExecuteProposal }
}

export default useExecuteProposal
