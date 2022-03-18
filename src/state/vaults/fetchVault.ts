import { SerializedVaultConfig } from 'config/constants/types'
import { SerializedVault } from 'state/types'
import fetchPublicVaultData from './fetchPublicVaultData'

const fetchVault = async (vault: SerializedVaultConfig): Promise<SerializedVault> => {
  const vaultPublicData = await fetchPublicVaultData(vault)

  return { ...vault, ...vaultPublicData }
}

export default fetchVault
