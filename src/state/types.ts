import { ThunkAction } from 'redux-thunk'
import { AnyAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import {
  CampaignType,
  SerializedFarmConfig,
  LotteryStatus,
  LotteryTicket,
  DeserializedPoolConfig,
  SerializedPoolConfig,
  Team,
  TranslatableText,
  DeserializedFarmConfig,
  SerializedVaultConfig,
  DeserializedVaultConfig,
} from 'config/constants/types'
import { NftToken, State as NftMarketState } from './nftMarket/types'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export interface BigNumberToJson {
  type: 'BigNumber'
  hex: string
}

export type SerializedBigNumber = string

export interface SerializedLaunchpadState {
  userDataLoaded: boolean

  totalSaleCount?: number
  fee?: SerializedBigNumber
  minAirdropAmount?: SerializedBigNumber
  minVote?: SerializedBigNumber

  userSaleCount?: number
}

export interface DeserializedLaunchpadState {
  userDataLoaded: boolean

  totalSaleCount?: number
  fee?: BigNumber
  minAirdropAmount: BigNumber
  minVote: BigNumber

  userSaleCount?: number
}

export interface SerializedGovernance {
  dev?: string
  quorum?: SerializedBigNumber
  delay?: number
  period?: number
}

export interface DeserializedGovernance {
  dev?: string
  quorum?: SerializedBigNumber
  delay?: number
  period?: number
}

export interface SerializedGovernanceState {
  data: SerializedGovernance
  loadArchivedData: boolean
}

export interface DeserializedGovernanceState {
  data: DeserializedGovernance
  loadArchivedData: boolean
}

interface SerializedVaultUserData {
  tokenAllowance: string
  lpAllowance: string
  lpTokenBalance: string
  tokenBalanceInVault: string
  stakedBalance: string
  earnings: string
  pendingEarnings: string
}

export interface DeserializedVaultUserData {
  tokenAllowance: BigNumber
  lpAllowance: BigNumber
  lpTokenBalance: BigNumber
  tokenBalanceInVault: BigNumber
  stakedBalance: BigNumber
  earnings: BigNumber
  pendingEarnings: BigNumber
}

export interface SerializedVault extends SerializedVaultConfig {
  spyPerBlock?: SerializedBigNumber
  userData?: SerializedVaultUserData
  farm?: SerializedFarm
  totalSupply?: SerializedBigNumber
  totalPoolPendingRewards?: SerializedBigNumber
  totalPoolAmount?: SerializedBigNumber
  nearestCompoundingTime?: SerializedBigNumber
  rewardForCompounder?: SerializedBigNumber
  isOld?: boolean
}

export interface DeserializedVault extends DeserializedVaultConfig {
  spyPerBlock?: BigNumber
  userData?: DeserializedVaultUserData
  farm?: DeserializedFarm
  totalSupply?: BigNumber
  totalPoolPendingRewards?: BigNumber
  totalPoolAmount?: BigNumber
  nearestCompoundingTime?: BigNumber
  rewardForCompounder?: BigNumber
  isOld?: boolean
}

export interface SerializedVaultsState {
  data: SerializedVault[]
  old: SerializedVault[]
  loadArchivedVaultsData: boolean
  userDataLoaded: boolean
  oldUserDataLoaded: boolean
}

export interface DeserializedVaultsState {
  data: DeserializedVault[]
  old: DeserializedVault[]
  loadArchivedVaultsData: boolean
  userDataLoaded: boolean
  oldUserDataLoaded: boolean
}

interface SerializedFarmUserData {
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
  nextHarvestUntil: number
  lockedAmount: string
}

export interface DeserializedFarmUserData {
  allowance: BigNumber
  tokenBalance: BigNumber
  stakedBalance: BigNumber
  earnings: BigNumber
  nextHarvestUntil: number
  lockedAmount: BigNumber
}

export interface SerializedFarm extends SerializedFarmConfig {
  tokenPriceBusd?: string
  quoteTokenPriceBusd?: string
  tokenAmountTotal?: SerializedBigNumber
  lpTotalInQuoteToken?: SerializedBigNumber
  lpTotalSupply?: SerializedBigNumber
  tokenPriceVsQuote?: SerializedBigNumber
  poolWeight?: SerializedBigNumber
  harvestInterval?: SerializedBigNumber
  spyPerBlock?: SerializedBigNumber
  userData?: SerializedFarmUserData
  isOld?: boolean
}

export interface DeserializedFarm extends DeserializedFarmConfig {
  tokenPriceBusd?: string
  quoteTokenPriceBusd?: string
  tokenAmountTotal?: BigNumber
  lpTotalInQuoteToken?: BigNumber
  lpTotalSupply?: BigNumber
  tokenPriceVsQuote?: BigNumber
  poolWeight?: BigNumber
  harvestInterval?: BigNumber
  spyPerBlock?: BigNumber
  userData?: DeserializedFarmUserData
  isOld?: boolean
}

interface CorePoolProps {
  startBlock?: number
  endBlock?: number
  apr?: number
  stakingTokenPrice?: number
  earningTokenPrice?: number
  isAutoVault?: boolean
}

export interface DeserializedPool extends DeserializedPoolConfig, CorePoolProps {
  totalStaked?: BigNumber
  stakingLimit?: BigNumber
  userData?: {
    allowance: BigNumber
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber
    pendingReward: BigNumber
  }
}

export interface SerializedPool extends SerializedPoolConfig, CorePoolProps {
  totalStaked?: SerializedBigNumber
  stakingLimit?: SerializedBigNumber
  userData?: {
    allowance: SerializedBigNumber
    stakingTokenBalance: SerializedBigNumber
    stakedBalance: SerializedBigNumber
    pendingReward: SerializedBigNumber
  }
}

export interface Profile {
  userId: number
  points: number
  teamId: number
  collectionAddress: string
  tokenId: number
  isActive: boolean
  username: string
  nft?: NftToken
  team: Team
  hasRegistered: boolean
}

// Slices states

export interface SerialzedNFTPoolPublicData {
  harvestInterval: number
  periodFinish: number
  rewardPerTokenStored: SerializedBigNumber
  rewardRate: SerializedBigNumber
  rewardPrecisionFactor: SerializedBigNumber
  totalSupply: SerializedBigNumber
  totalBalance: SerializedBigNumber
  harvestFee: SerializedBigNumber
}

export interface SerialzedNFTFactoryPublicData {
  activeRuleId: SerializedBigNumber
  maxMintAmount: SerializedBigNumber
  maxMintQuantity: SerializedBigNumber
  maxMintQuantityPerClick: SerializedBigNumber
  mintCost: SerializedBigNumber
  mintCostDiscount: SerializedBigNumber
  mintCostDiscountQuantity: SerializedBigNumber
  mintedQuantity: SerializedBigNumber
  costToken: string
}

export interface DeserialzedNFTFactoryPublicData {
  activeRuleId: BigNumber
  maxMintAmount: BigNumber
  maxMintQuantity: BigNumber
  maxMintQuantityPerClick: BigNumber
  mintCost: BigNumber
  mintCostDiscount: BigNumber
  mintCostDiscountQuantity: BigNumber
  mintedQuantity: BigNumber
  costToken?: string
}
  

export interface SerialzedNFTPoolUserData {
  balance: SerializedBigNumber
  earning: SerializedBigNumber
  nextHarvestUntil: number
  userDataLoaded: boolean
}

export interface DeserialzedNFTPoolPublicData {
  harvestInterval: number
  periodFinish: number
  rewardPerTokenStored: BigNumber
  rewardRate: BigNumber
  rewardPrecisionFactor: BigNumber
  totalSupply: BigNumber
  totalBalance: BigNumber
  harvestFee: BigNumber
}

export interface DeserialzedNFTPoolUserData {
  balance: BigNumber
  earning: BigNumber
  nextHarvestUntil: number
  userDataLoaded: boolean
}


export interface SerializedNFTState {
  userDataLoaded: boolean
  loadArchivedData: boolean
  
  spyBalance?: SerializedBigNumber
  castNFTAllowance?: SerializedBigNumber
  castSignatureAllowance?: SerializedBigNumber

  poolPublicData?: SerialzedNFTPoolPublicData
  poolUserData?: SerialzedNFTPoolUserData

  oldPoolPublicData?: SerialzedNFTPoolPublicData
  oldPoolUserData?: SerialzedNFTPoolUserData

  signaturePoolPublicData?: SerialzedNFTPoolPublicData
  signaturePoolUserData?: SerialzedNFTPoolUserData
  signatureFactoryData?: SerialzedNFTFactoryPublicData

  nftBalance: SerializedNFTGego[]
  oldNftBalance: SerializedNFTGego[]
  signatureBalance: SerializedNFTGego[]

  factoryAllowance?: boolean
  rewardAllowance?: boolean
  marketplaceAllowance?: boolean
  oldRewardAllowance?: boolean
  signatureRewardAllowance?: boolean
  signatureMarketplaceAllowance?: boolean
}

export interface DeserializedNFTState {
  userDataLoaded: boolean
  loadArchivedData: boolean
  
  spyBalance?: BigNumber
  castNFTAllowance?: BigNumber
  castSignatureAllowance?: BigNumber

  oldPoolPublicData?: DeserialzedNFTPoolPublicData
  oldPoolUserData?: DeserialzedNFTPoolUserData

  poolPublicData?: DeserialzedNFTPoolPublicData
  poolUserData?: DeserialzedNFTPoolUserData

  nftBalance: DeserializedNFTGego[]
  oldNftBalance: DeserializedNFTGego[]
  signatureBalance: DeserializedNFTGego[]
  factoryAllowance?: boolean
  rewardAllowance?: boolean
  marketplaceAllowance?: boolean
  oldRewardAllowance?: boolean
}

export interface SerializedNFTGego {
  address: string
  staked: boolean
  id: string
  grade: number
  lockedDays: number
  blockNum: SerializedBigNumber
  createdTime: number
  quality: number
  amount: SerializedBigNumber
  efficiency?: SerializedBigNumber
  resBaseId?: SerializedBigNumber
  expiringTime?: SerializedBigNumber
}

export interface DeserializedNFTGego {
  address: string
  staked: boolean
  id: string
  grade: number
  lockedDays: number
  blockNum?: BigNumber
  createdTime: number
  quality: number
  amount: BigNumber
  efficiency?: BigNumber
  resBaseId?: BigNumber
  expiringTime?: BigNumber
}

export interface SerializedFarmsState {
  data: SerializedFarm[]
  old: SerializedFarm[]
  loadArchivedFarmsData: boolean
  userDataLoaded: boolean
  oldUserDataLoaded: boolean
}

export interface DeserializedFarmsState {
  data: DeserializedFarm[]
  old: DeserializedFarm[]
  loadArchivedFarmsData: boolean
  userDataLoaded: boolean
  oldUserDataLoaded: boolean
}

export interface VaultFees {
  performanceFee: number
  callFee: number
  withdrawalFee: number
  withdrawalFeePeriod: number
}

export interface VaultUser {
  isLoading: boolean
  userShares: string
  cakeAtLastUserAction: string
  lastDepositedTime: string
  lastUserActionTime: string
}
export interface CakeVault {
  totalShares?: string
  pricePerFullShare?: string
  totalCakeInVault?: string
  estimatedCakeBountyReward?: string
  totalPendingCakeHarvest?: string
  fees?: VaultFees
  userData?: VaultUser
}

export interface PoolsState {
  data: SerializedPool[]
  cakeVault: CakeVault
  userDataLoaded: boolean
}

export enum ProfileAvatarFetchStatus {
  NOT_FETCHED = 'not-fetched',
  FETCHING = 'fetching',
  FETCHED = 'fetched',
}

export interface ProfileState {
  isInitialized: boolean
  isLoading: boolean
  hasRegistered: boolean
  data: Profile
  profileAvatars: {
    [key: string]: {
      username: string
      nft: NftToken
      hasRegistered: boolean
      usernameFetchStatus: ProfileAvatarFetchStatus
      avatarFetchStatus: ProfileAvatarFetchStatus
    }
  }
}

export type TeamResponse = {
  0: string
  1: string
  2: string
  3: string
  4: boolean
}

export type TeamsById = {
  [key: string]: Team
}

export interface TeamsState {
  isInitialized: boolean
  isLoading: boolean
  data: TeamsById
}

export interface Achievement {
  id: string
  type: CampaignType
  address: string
  title: TranslatableText
  description?: TranslatableText
  badge: string
  points: number
}

export enum AchievementFetchStatus {
  ERROR = 'error',
  NOT_FETCHED = 'not-fetched',
  FETCHING = 'fetching',
  FETCHED = 'fetched',
}

export interface AchievementState {
  achievements: Achievement[]
  achievementFetchStatus: AchievementFetchStatus
}

// Block

export interface BlockState {
  currentBlock: number
  initialBlock: number
}

// Predictions

export enum BetPosition {
  BULL = 'Bull',
  BEAR = 'Bear',
  HOUSE = 'House',
}

export enum PredictionStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface Round {
  id: string
  epoch: number
  position: BetPosition
  failed: boolean
  startAt: number
  startBlock: number
  startHash: string
  lockAt: number
  lockBlock: number
  lockHash: string
  lockPrice: number
  lockRoundId: string
  closeAt: number
  closeBlock: number
  closeHash: string
  closePrice: number
  closeRoundId: string
  totalBets: number
  totalAmount: number
  bullBets: number
  bullAmount: number
  bearBets: number
  bearAmount: number
  bets?: Bet[]
}

export interface Market {
  paused: boolean
  epoch: number
}

export interface Bet {
  id?: string
  hash?: string
  amount: number
  position: BetPosition
  claimed: boolean
  claimedAt: number
  claimedBlock: number
  claimedHash: string
  claimedBNB: number
  claimedNetBNB: number
  createdAt: number
  updatedAt: number
  user?: PredictionUser
  round?: Round
}

export interface PredictionUser {
  id: string
  createdAt: number
  updatedAt: number
  block: number
  totalBets: number
  totalBetsBull: number
  totalBetsBear: number
  totalBNB: number
  totalBNBBull: number
  totalBNBBear: number
  totalBetsClaimed: number
  totalBNBClaimed: number
  winRate: number
  averageBNB: number
  netBNB: number
  bets?: Bet[]
}

export enum HistoryFilter {
  ALL = 'all',
  COLLECTED = 'collected',
  UNCOLLECTED = 'uncollected',
}

export interface LedgerData {
  [key: string]: {
    [key: string]: ReduxNodeLedger
  }
}

export interface RoundData {
  [key: string]: ReduxNodeRound
}

export interface ReduxNodeLedger {
  position: BetPosition
  amount: BigNumberToJson
  claimed: boolean
}

export interface NodeLedger {
  position: BetPosition
  amount: ethers.BigNumber
  claimed: boolean
}

export interface ReduxNodeRound {
  epoch: number
  startTimestamp: number | null
  lockTimestamp: number | null
  closeTimestamp: number | null
  lockPrice: BigNumberToJson | null
  closePrice: BigNumberToJson | null
  totalAmount: BigNumberToJson
  bullAmount: BigNumberToJson
  bearAmount: BigNumberToJson
  rewardBaseCalAmount: BigNumberToJson
  rewardAmount: BigNumberToJson
  oracleCalled: boolean
  lockOracleId: string
  closeOracleId: string
}

export interface NodeRound {
  epoch: number
  startTimestamp: number | null
  lockTimestamp: number | null
  closeTimestamp: number | null
  lockPrice: ethers.BigNumber | null
  closePrice: ethers.BigNumber | null
  totalAmount: ethers.BigNumber
  bullAmount: ethers.BigNumber
  bearAmount: ethers.BigNumber
  rewardBaseCalAmount: ethers.BigNumber
  rewardAmount: ethers.BigNumber
  oracleCalled: boolean
  closeOracleId: string
  lockOracleId: string
}

export enum LeaderboardLoadingState {
  INITIAL,
  LOADING,
  IDLE,
}

export type LeaderboardFilterTimePeriod = '1d' | '7d' | '1m' | 'all'

export interface LeaderboardFilter {
  address?: string
  orderBy?: string
  timePeriod?: LeaderboardFilterTimePeriod
}

export interface PredictionsState {
  status: PredictionStatus
  isLoading: boolean
  isHistoryPaneOpen: boolean
  isChartPaneOpen: boolean
  isFetchingHistory: boolean
  historyFilter: HistoryFilter
  currentEpoch: number
  intervalSeconds: number
  minBetAmount: string
  bufferSeconds: number
  lastOraclePrice: string
  history: Bet[]
  totalHistory: number
  currentHistoryPage: number
  hasHistoryLoaded: boolean
  rounds?: RoundData
  ledgers?: LedgerData
  claimableStatuses: {
    [key: string]: boolean
  }
  leaderboard: {
    selectedAddress: string
    loadingState: LeaderboardLoadingState
    filters: LeaderboardFilter
    skip: number
    hasMoreResults: boolean
    addressResults: {
      [key: string]: PredictionUser
    }
    results: PredictionUser[]
  }
}

// Voting

/* eslint-disable camelcase */
/**
 * @see https://hub.snapshot.page/graphql
 */
export interface VoteWhere {
  id?: string
  id_in?: string[]
  voter?: string
  voter_in?: string[]
  proposal?: string
  proposal_in?: string[]
}

export enum SnapshotCommand {
  PROPOSAL = 'proposal',
  VOTE = 'vote',
}

export enum ProposalType {
  ALL = 'all',
  CORE = 'core',
  COMMUNITY = 'community',
}

export enum ProposalState {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export interface Space {
  id: string
  name: string
}

export interface Proposal {
  author: string
  body: string
  choices: string[]
  end: number
  id: string
  snapshot: string
  space: Space
  start: number
  state: ProposalState
  title: string
}

export interface Vote {
  id: string
  voter: string
  created: number
  space: Space
  proposal: {
    choices: Proposal['choices']
  }
  choice: number
  metadata?: {
    votingPower: string
    verificationHash: string
  }
  _inValid?: boolean
}

export enum VotingStateLoadingStatus {
  INITIAL = 'initial',
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
}

export interface VotingState {
  proposalLoadingStatus: VotingStateLoadingStatus
  proposals: {
    [key: string]: Proposal
  }
  voteLoadingStatus: VotingStateLoadingStatus
  votes: {
    [key: string]: Vote[]
  }
}

export interface LotteryRoundUserTickets {
  isLoading?: boolean
  tickets?: LotteryTicket[]
}

interface LotteryRoundGenerics {
  isLoading?: boolean
  lotteryId: string
  status: LotteryStatus
  startTime: string
  endTime: string
  treasuryFee: string
  firstTicketId: string
  lastTicketId: string
  finalNumber: number
}

export interface LotteryRound extends LotteryRoundGenerics {
  userTickets?: LotteryRoundUserTickets
  priceTicketInCake: BigNumber
  discountDivisor: BigNumber
  amountCollectedInCake: BigNumber
  cakePerBracket: string[]
  countWinnersPerBracket: string[]
  rewardsBreakdown: string[]
}

export interface LotteryResponse extends LotteryRoundGenerics {
  priceTicketInCake: SerializedBigNumber
  discountDivisor: SerializedBigNumber
  amountCollectedInCake: SerializedBigNumber
  cakePerBracket: SerializedBigNumber[]
  countWinnersPerBracket: SerializedBigNumber[]
  rewardsBreakdown: SerializedBigNumber[]
}

export interface LotteryState {
  currentLotteryId: string
  maxNumberTicketsPerBuyOrClaim: string
  isTransitioning: boolean
  currentRound: LotteryResponse & { userTickets?: LotteryRoundUserTickets }
  lotteriesData?: LotteryRoundGraphEntity[]
  userLotteryData?: LotteryUserGraphEntity
}

export interface LotteryRoundGraphEntity {
  id: string
  totalUsers: string
  totalTickets: string
  winningTickets: string
  status: LotteryStatus
  finalNumber: string
  startTime: string
  endTime: string
  ticketPrice: SerializedBigNumber
}

export interface LotteryUserGraphEntity {
  account: string
  totalCake: string
  totalTickets: string
  rounds: UserRound[]
}

export interface UserRound {
  claimed: boolean
  lotteryId: string
  status: LotteryStatus
  endTime: string
  totalTickets: string
  tickets?: LotteryTicket[]
}

export type UserTicketsResponse = [ethers.BigNumber[], number[], boolean[]]

// Global state

export interface State {
  achievements: AchievementState
  block: BlockState
  farms: SerializedFarmsState
  vaults: SerializedVaultsState
  pools: PoolsState
  nft: SerializedNFTState
  predictions: PredictionsState
  profile: ProfileState
  teams: TeamsState
  voting: VotingState
  lottery: LotteryState
  nftMarket: NftMarketState
  governance: SerializedGovernanceState
  communityGovernance: SerializedGovernanceState
  launchpad: SerializedLaunchpadState
}


export enum NFTMarketPlaceSearchFilter {
    SMART,
    END_TIME,
    LATEST_RELEASE,
    LOWEST_PRICE,
    HIGHEST_PRICE
}