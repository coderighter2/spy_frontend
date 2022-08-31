import BigNumber from "bignumber.js";

export enum ProposalCommand {
  ADJUST_FARM_APY = 0,
  REFILL_NFT = 1
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
  startTime: number
  endTime: number
  expiringTime: number
  forVotes: BigNumber
  againstVotes: BigNumber
  abstainVotes: BigNumber
  executed: boolean
  canceled: boolean
  state: ProposalState
}

export interface ProposalData {
  proposalId: string
  proposer: string
  description: string
  name?: string
  body?: string
  state: ProposalStateGQ
  totalCurrentVoters: number
  currentYesVote: BigNumber
  currentNoVote: BigNumber
  currentYesVoteCount?: number
  currentNoVoteCount?: number
  startTime: number
  endTime: number
  expiringTime: number
  timestamp: number
  lastUpdateTimestamp: number
  canceledAt?: number
  executedAt?: number
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