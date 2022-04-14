import { SerializedFarm } from 'state/types'
import fetchPublicFarmData from './fetchPublicFarmData'

const fetchFarm = async (farm: SerializedFarm, isOld = false): Promise<SerializedFarm> => {
  const farmPublicData = await fetchPublicFarmData(farm, isOld)

  return { ...farm, ...farmPublicData }
}

export default fetchFarm
