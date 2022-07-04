import BigNumber from "bignumber.js";

export enum ProposalCommand {
  ADJUST_FARM_APY = 0,
  REFILL_NFT = 1,
  ADJUST_FARM_APY_OLD = 2,
}

export enum VoteType {
    Against,
    For,
    Abstain
}

export const ProposalStates: string[] = [
  "Pending",
  "Active",
  "Canceled",
  "Defeated",
  "Succeeded",
  "Queued",
  "Expired",
  "Executed"
]

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}

export enum ProposalStateGQ {
  Pending = "Pending",
  Active = "Active",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Canceled = "Canceled",
  Queued = "Queued",
  Executed = "Executed"
}

export interface Proposal {
  proposalId: string
  proposer: string
  startBlock: number
  endBlock: number
  forVotes: BigNumber
  againstVotes: BigNumber
  abstainVotes: BigNumber
  executed: boolean
  canceled: boolean
  state: ProposalState
  eta?: number
}

export interface ProposalData {
  proposalId: string
  proposer: string
  targets: string[]
  values: string[]
  calldatas: string[]
  description: string
  name?: string
  body?: string
  state: ProposalStateGQ
  totalCurrentVoters: number
  currentYesVote: BigNumber
  currentNoVote: BigNumber
  currentYesVoteCount?: number
  currentNoVoteCount?: number
  startBlock: number
  endBlock: number
  timestamp: number
  lastUpdateTimestamp: number
  canceledAt?: number
  executedAt?: number
  queueEta?: number
}

export interface ProposalEvent {
  id: string
  timestamp: number
  state: ProposalStateGQ
  txid?: string
}

export interface VoteData {
  id: string
  voter: string
  support: number
  weight: BigNumber
  reason?: string
}