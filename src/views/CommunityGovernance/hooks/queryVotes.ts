import BigNumber from "bignumber.js";
import { GRAPH_API_GOVERNANCE_MANUAL } from 'config/constants/endpoints';
import request from "graphql-request"
import { getCommunityGovernanceAddress } from 'utils/addressHelpers';
import { VoteData } from '../types';

interface VoteFields {
    id: string
    voter: string
    support: number
    weight: string
    reason?: string
}

interface VotesResponse {
    for: VoteFields[]
    against: VoteFields[]
}


export const queryVotes = async(proposalId: string): Promise<{forVotes: VoteData[], againstVotes: VoteData[]}> => {
    const contractAddress = getCommunityGovernanceAddress()

    const query = `
        query get_votes_summary {
            for: votes(first: 4, where: {proposal: "${contractAddress.toLowerCase()}-${proposalId}", support:1}, orderBy: weight, orderDirection:desc) {
                voter
                support
                weight
                reason
            },
            against: votes(first: 4, where: {proposal: "${contractAddress.toLowerCase()}-${proposalId}", support:0}, orderBy: weight, orderDirection:desc) {
                voter
                support
                weight
                reason
            },
        }
    `;

    try {
        const data = await request<VotesResponse>(GRAPH_API_GOVERNANCE_MANUAL, query)

        if (!data.for || !data.against) {
            return undefined
        }

        return {
            forVotes: data.for.map((vote) => parseVoteResponse(vote)),
            againstVotes: data.against.map((vote) => parseVoteResponse(vote))
        }
    } catch (error) {
        console.error('Failed to fetch auction data', error)
        return undefined;
    }
}


const parseVoteResponse = (vote: VoteFields) : VoteData => {
    const {
        id,
        voter,
        support,
        weight,
        reason
    } = vote;
    return {
        id,
        voter,
        support,
        weight: new BigNumber(weight),
        reason
    }
}