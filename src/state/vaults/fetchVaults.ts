import { SerializedVaultConfig } from 'config/constants/types'
import { SerializedFarm } from 'state/types'
import fetchVault from './fetchVault'

const fetchVaults = async (vaultsToFetch: SerializedVaultConfig[], isOld = false) => {
  const data = await Promise.all(
    vaultsToFetch.map(async (vaultConfig) => {
      const vault = await fetchVault(vaultConfig, isOld)
      return vault
    }),
  )
  return data
}

export default fetchVaults
