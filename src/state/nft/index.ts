
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { SerializedNFTState } from 'state/types'
import { fetchNFTBalance, fetchStakedNFTs } from './fetchNFT'
import { fetchNFTGegos, fetchNFTAllowances, PublicNFTData } from './fetchNFTData'
import { fetchGeneralNFTRewardUserData, fetchGeneralNFTRewardPublicData, PublicNFTRewardUserData, PublicNFTRewardPoolData } from './fetchNFTReward'
import { fetchPublicNFTData } from './fetchPublicNFTData'

const initialState: SerializedNFTState = {
    userDataLoaded: false,
    loadArchivedData: false,
    nftBalance: [],
}

interface NFTUserDataResponse {
    spyBalance: string
    castNFTAllowance: string
}

interface NFTAllowanceDataResponse {
    factoryAllowance: boolean
    rewardAllowance: boolean
}

export const fetchNFTUserDataAsync = createAsyncThunk<NFTUserDataResponse, { account: string}>(
    'nft/fetchNFTUserDataAsync',
    async ({account}) => {
        const publicData = await fetchPublicNFTData(account)
        return {
            spyBalance: publicData.tokenAmountTotal,
            castNFTAllowance: publicData.nftCastAllowance
        }
    },
)

export const fetchNFTPoolPublicDataAsync = createAsyncThunk<PublicNFTRewardPoolData>(
    'nft/fetchNFTPoolPublicDataAsync',
    async () => {
        const publicData = await fetchGeneralNFTRewardPublicData()
        return publicData
    },
)

export const fetchNFTPoolUserDataAsync = createAsyncThunk<PublicNFTRewardUserData, { account: string}>(
    'nft/fetchNFTPoolUserDataAsync',
    async ({account}) => {
        const userData = await fetchGeneralNFTRewardUserData(account)
        return userData
    },
)

export const fetchNFTUserBalanceDataAsync = createAsyncThunk<PublicNFTData[], { account: string}>(
    'nft/fetchNFTuserBalanceDataAsync',
    async ({account}) => {
        const tokenIds = await fetchNFTBalance(account);
        const tokenIdsStaked = await fetchStakedNFTs(account);
        const tokenGegos = await fetchNFTGegos([...tokenIds.filter((id) => id !== '0'), ...tokenIdsStaked.filter((id) => id !== '0')]);
        tokenGegos.forEach((gego, index) =>  {
            tokenGegos[index].staked = tokenIdsStaked.indexOf(gego.id) !== -1
        })
        return tokenGegos;
    },
)

export const fetchNFTAllowancesAsync = createAsyncThunk<NFTAllowanceDataResponse, { account: string}>(
    'nft/fetchNFTAllowancesAsync',
    async ({account}) => {
        const allowances = await fetchNFTAllowances(account)
        return allowances;
    },
)

export const nftSlice = createSlice({
    name: 'nftv2',
    initialState,
    reducers: {
        setLoadArchivedNFTData: (state, action) => {
            const loadArchivedData = action.payload
            state.loadArchivedData = loadArchivedData
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNFTUserDataAsync.fulfilled, (state,action) => {
            state.spyBalance = action.payload.spyBalance
            state.castNFTAllowance = action.payload.castNFTAllowance
        })
        builder.addCase(fetchNFTPoolPublicDataAsync.fulfilled, (state,action) => {
            state.poolPublicData = {
                ...state.poolPublicData,
                ...action.payload
            }
        })
        builder.addCase(fetchNFTPoolUserDataAsync.fulfilled, (state,action) => {
            state.poolUserData = {
                ...state.poolUserData,
                ...action.payload
            }
        })
        builder.addCase(fetchNFTUserBalanceDataAsync.fulfilled, (state,action) => {
            state.nftBalance = action.payload.map((gego) => {
                return {
                    ...gego
                }
            })
        })
        builder.addCase(fetchNFTAllowancesAsync.fulfilled, (state,action) => {
            state.rewardAllowance = action.payload.rewardAllowance
            state.factoryAllowance = action.payload.factoryAllowance
        })
    }
})

export const {setLoadArchivedNFTData } = nftSlice.actions
export default nftSlice.reducer