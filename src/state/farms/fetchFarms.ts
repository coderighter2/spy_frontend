import { SerializedFarmConfig } from 'config/constants/types'
import fetchFarm from './fetchFarm'

const fetchFarms = async (farmsToFetch: SerializedFarmConfig[], isOld = false) => {
  const data = await Promise.all(
    farmsToFetch.map(async (farmConfig) => {
      const farm = await fetchFarm(farmConfig, isOld)
      const serializedFarm = { ...farm, token: farm.token, quoteToken: farm.quoteToken, isOld }
      return serializedFarm
    }),
  )
  return data
}

export default fetchFarms
