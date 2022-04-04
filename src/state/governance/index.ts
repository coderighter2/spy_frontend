import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { SerializedGovernance, SerializedGovernanceState } from '../types'
import fetchPublicGovernanceData from './fetchPublicGovernanceData'

const initialState: SerializedGovernanceState = {
  data: {},
  loadArchivedData: false,
}

export const fetchGovernancePublicDataAsync = createAsyncThunk<SerializedGovernance>(
  'governance/fetchGovernancePublicDataAsync',
  async () => {
    const governanceData = await fetchPublicGovernanceData()

    return governanceData
  },
)

export const governanceSlice = createSlice({
  name: 'Governance',
  initialState,
  reducers: {
    setLoadGovernanceArchivedData: (state, action) => {
      const loadArchivedData = action.payload
      state.loadArchivedData = loadArchivedData
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGovernancePublicDataAsync.fulfilled, (state, action) => {
      state.data = {
        ...state.data, ...action.payload
      }
    })
  },
})

// Actions
export const { setLoadGovernanceArchivedData } = governanceSlice.actions

export default governanceSlice.reducer