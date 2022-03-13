import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import vaultsConfig from 'config/constants/vaults'
import {
  fetchVaultUserEarnings,
  fetchVaultUserInfos,
  fetchVaultUserTokenBalances,
} from './fetchVaultUser'
import { SerializedVaultsState, SerializedVault } from '../types'
import fetchVaults from './fetchVaults'

const noAccountVaultsConfig = vaultsConfig.map((vault) => ({
  ...vault,
  userData: {
    tokenBalance: '0',
    stakedBalance: '0',
    earnings: '0',
  },
}))

const initialState: SerializedVaultsState = {
  data: noAccountVaultsConfig,
  loadArchivedVaultsData: false,
  userDataLoaded: false,
}

// Async thunks
export const fetchVaultsPublicDataAsync = createAsyncThunk<SerializedVault[], number[]>(
  'vaults/fetchVaultsPublicDataAsync',
  async (pids) => {
    const vaultsToFetch = vaultsConfig.filter((vaultConfig) => pids.includes(vaultConfig.pid))

    const vaults = await fetchVaults(vaultsToFetch)

    return vaults
  },
)

interface VaultUserDataResponse {
  pid: number
  tokenBalance: string
  stakedBalance: string
  earnings: string
}

export const fetchVaultUserDataAsync = createAsyncThunk<VaultUserDataResponse[], { account: string; pids: number[] }>(
  'vaults/fetchVaultUserDataAsync',
  async ({ account, pids }) => {
    const vaultsToFetch = vaultsConfig.filter((vaultConfig) => pids.includes(vaultConfig.pid))
    const userVaultTokenBalances = await fetchVaultUserTokenBalances(account, vaultsToFetch)
    const userInfos = await fetchVaultUserInfos(account, vaultsToFetch)
    const userVaultEarnings = await fetchVaultUserEarnings(account, vaultsToFetch)

    return userVaultTokenBalances.map((_, index) => {
      return {
        pid: vaultsToFetch[index].pid,
        tokenBalance: userVaultTokenBalances[index],
        stakedBalance: userInfos[0][index],
        earnings: userVaultEarnings[index],
      }
    })
  },
)

export const vaultsSlice = createSlice({
  name: 'Vaults',
  initialState,
  reducers: {
    setLoadArchivedVaultsData: (state, action) => {
      const loadArchivedVaultsData = action.payload
      state.loadArchivedVaultsData = loadArchivedVaultsData
    },
  },
  extraReducers: (builder) => {
    // Update vaults with live data
    builder.addCase(fetchVaultsPublicDataAsync.fulfilled, (state, action) => {
      console.log('vaults', action.payload)
      state.data = state.data.map((vault) => {
        const liveVaultData = action.payload.find((vaultData) => vaultData.pid === vault.pid)
        return { ...vault, ...liveVaultData }
      })
    })

    // Update vaults with user data
    builder.addCase(fetchVaultUserDataAsync.fulfilled, (state, action) => {
      action.payload.forEach((userDataEl) => {
        const { pid } = userDataEl
        const index = state.data.findIndex((vault) => vault.pid === pid)
        state.data[index] = { ...state.data[index], userData: userDataEl }
      })
      state.userDataLoaded = true
    })
  },
})

// Actions
export const { setLoadArchivedVaultsData } = vaultsSlice.actions

export default vaultsSlice.reducer