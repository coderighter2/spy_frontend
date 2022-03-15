import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import vaultsConfig from 'config/constants/vaults'
import {
  fetchVaultUserDatas,
} from './fetchVaultUser'
import { SerializedVaultsState, SerializedVault } from '../types'
import fetchVaults from './fetchVaults'

const noAccountVaultsConfig = vaultsConfig.map((vault) => ({
  ...vault,
  userData: {
    tokenAllowance: '0',
    lpAllowance: '0',
    lpTokenBalance: '0',
    tokenBalanceInVault: '0',
    stakedBalance: '0',
    pendingEarnings: '0',
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
  tokenAllowance: string
  lpAllowance: string
  lpTokenBalance: string
  tokenBalanceInVault: string
  stakedBalance: string
  pendingEarnings: string
  earnings: string
}

export const fetchVaultUserDataAsync = createAsyncThunk<VaultUserDataResponse[], { account: string; pids: number[] }>(
  'vaults/fetchVaultUserDataAsync',
  async ({ account, pids }) => {
    const vaultsToFetch = vaultsConfig.filter((vaultConfig) => pids.includes(vaultConfig.pid))
    console.log('fetching user data')
    const datas = await fetchVaultUserDatas(account, vaultsToFetch)
    console.log('user data', datas)
    return datas.map((data, index) => {
      return {
        ...data,
        pid: vaultsToFetch[index].pid
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