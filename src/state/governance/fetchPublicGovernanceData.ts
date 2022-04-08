import BigNumber from 'bignumber.js'
import spyGovernorAbi from 'config/abi/spyGovernor.json'
import { getGovernanceAddress } from 'utils/addressHelpers'
import multicall from 'utils/multicall'

type PublicGovernanceData = {
  dev: string
  quorum: SerializedBigNumber
  delay: number
  period: number
}

const fetchPublicGovernanceData = async (): Promise<PublicGovernanceData> => {
  const contractAddress = getGovernanceAddress()
  
  const [[devAddr], [quorum], [delay], [period]] = await multicall(spyGovernorAbi, [
    {
      address: contractAddress,
      name: 'dev'
    },
    {
      address: contractAddress,
      name: 'quorum',
      params: [0]
    },
    {
      address: contractAddress,
      name: 'votingDelay'
    },
    {
      address: contractAddress,
      name: 'votingPeriod'
    },
  ])

  return {
    dev: devAddr,
    quorum: new BigNumber(quorum._hex).toString(),
    delay: new BigNumber(delay._hex).toNumber(),
    period: new BigNumber(period._hex).toNumber()
  }
}

export default fetchPublicGovernanceData