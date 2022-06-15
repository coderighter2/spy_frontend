import { SerializedVaultConfig } from 'config/constants/types'
import { SerializedVault } from 'state/types'
import fetchPublicVaultData from './fetchPublicVaultData'

const fetchVault = async (vault: SerializedVaultConfig, isOld = false): Promise<SerializedVault> => {
  const vaultPublicData = await fetchPublicVaultData(vault, isOld)

  return { ...vault, ...vaultPublicData, isOld }
}

export default fetchVault
