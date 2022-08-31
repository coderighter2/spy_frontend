import BigNumber from 'bignumber.js'
import spyCommunityGovernorAbi from 'config/abi/spyCommunityGovernor.json'
import { getCommunityGovernanceAddress } from 'utils/addressHelpers'
import multicall from 'utils/multicall'

type PublicGovernanceData = {
  dev: string
  quorum: SerializedBigNumber
  delay: number
  period: number
}

const fetchPublicGovernanceData = async (): Promise<PublicGovernanceData> => {
  const contractAddress = getCommunityGovernanceAddress()
  
  const [[devAddr], [delay]] = await multicall(spyCommunityGovernorAbi, [
    {
      address: contractAddress,
      name: 'dev'
    },
    {
      address: contractAddress,
      name: 'votingDelay'
    },
  ])

  return {
    dev: devAddr,
    quorum: '0',
    delay: new BigNumber(delay._hex).toNumber(),
    period: 0
  }
}

export default fetchPublicGovernanceData