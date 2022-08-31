import BigNumber from "bignumber.js";
import { GRAPH_API_GOVERNANCE_MANUAL } from 'config/constants/endpoints';
import request from "graphql-request"
import { getCommunityGovernanceAddress } from 'utils/addressHelpers';
import { ProposalData, ProposalStateGQ } from '../types';


interface ProposalFields {
    proposalId: string
    proposer: string
    description: string
    state: ProposalStateGQ
    totalCurrentVoters: number
    currentYesVote: string
    currentNoVote: string
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

interface ProposalResponse {
    proposal?: ProposalFields
}

interface ProposalsResponse {
    proposals?: ProposalFields[]
    summary: {
        proposalCount: number
    }
}

export const queryProposalById = async(id: string): Promise<ProposalData> => {
    const contractAddress = getCommunityGovernanceAddress()

    const query = `
        query get_proposal {
            proposal: proposal(id:"${contractAddress.toLowerCase()}-${id}") {
                proposalId
                proposer
                description
                state
                totalCurrentVoters
                currentYesVote
                currentYesVoteCount
                currentNoVote
                currentNoVoteCount
                startTime
                endTime
                expiringTime
                timestamp
                lastUpdateTimestamp
                canceledAt
                executedAt
            }
        }
    `;

    try {
        const data = await request<ProposalResponse>(GRAPH_API_GOVERNANCE_MANUAL, query)

        if (!data.proposal) {
            return undefined
        }
        return parseProposalResponse(data.proposal)
    } catch (error) {
        console.error('Failed to fetch auction data', error)
        return undefined;
    }
}

export const queryProposals = async(skip: number, count: number): Promise<{items: ProposalData[], totalCount: number}> => {
    const contractAddress = getCommunityGovernanceAddress()

    const query = `
        query get_proposals {
            summary: proposalSummary(id: "${contractAddress.toLowerCase()}") {
                proposalCount
            },
            proposals: proposals(skip: ${skip}, first:${count}, orderBy: timestamp, orderDirection:desc) {
                proposalId
                proposer
                description
                state
                totalCurrentVoters
                currentYesVote
                currentNoVote
                startTime
                endTime
                expiringTime
                timestamp
                lastUpdateTimestamp
                canceledAt
                executedAt
            }
        }
    `;

    const data = await request<ProposalsResponse>(GRAPH_API_GOVERNANCE_MANUAL, query)

    if (!data.proposals || !data.summary) {
        throw new Error('wrong data')
    }

    return {
        items: data.proposals.map((proposal) => parseProposalResponse(proposal)),
        totalCount: data.summary.proposalCount
    }
}


const parseProposalResponse = (proposal: ProposalFields) : ProposalData => {

    const {  
        proposalId,
        proposer,
        description,
        state,
        totalCurrentVoters,
        currentYesVote,
        currentYesVoteCount,
        currentNoVote,
        currentNoVoteCount,
        startTime,
        endTime,
        expiringTime,
        timestamp,
        lastUpdateTimestamp,
        canceledAt,
        executedAt,
    } = proposal

    const [name, body] = description.split(':::')
    return {
        proposalId,
        proposer,
        description,
        name,
        body,
        state,
        totalCurrentVoters,
        currentYesVote: new BigNumber(currentYesVote),
        currentYesVoteCount,
        currentNoVote: new BigNumber(currentNoVote),
        currentNoVoteCount,
        startTime,
        endTime,
        expiringTime,
        timestamp,
        lastUpdateTimestamp,
        canceledAt,
        executedAt
    }
}