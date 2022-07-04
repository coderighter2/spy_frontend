import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { SerializedSwapPoolState } from 'state/types'
import { fetchSwapPoolUserData, fetchSwapPoolPublicData, PublicLaunchpadData, PublicLaunchpadUserData } from './fetchSwapPool'

const initialState: SerializedSwapPoolState = {
    userDataLoaded: false,
}


export const fetchSwapPoolPublicDataAsync = createAsyncThunk<PublicLaunchpadData>(
    'swapPool/fetchSwapPoolPublicDataAsync',
async () => {
    const data = await fetchSwapPoolPublicData()
    return data
},
)

export const fetchSwapPoolUserDataAsync = createAsyncThunk<PublicLaunchpadUserData, {
  account: string
}>(
    'swapPool/fetchLockerUserDataAsync',
async ({account}) => {
    const data = await fetchSwapPoolUserData(account)
    return data
  },
)

export const lockerSlices = createSlice({
    name: 'Locker',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
  
      // Update privatesales with user data
      builder.addCase(fetchSwapPoolPublicDataAsync.fulfilled, (state, action) => {
        state.fee = action.payload.fee
        state.totalSaleCount = action.payload.totalSaleCount
      })

      builder.addCase(fetchSwapPoolUserDataAsync.fulfilled, (state, action) => {
        state.userSaleCount = action.payload.userSaleCount
        state.userDataLoaded = true
      })
    },
  })
  
  // Actions
  
  export default lockerSlices.reducer