import BigNumber from "bignumber.js";
import { GRAPH_API_GOVERNANCE } from 'config/constants/endpoints';
import request from "graphql-request"
import { getGovernanceAddress } from 'utils/addressHelpers';
import { ProposalData, ProposalStateGQ } from '../types';


interface ProposalFields {
    proposalId: string
    proposer: string
    targets: string[]
    values: string[]
    calldatas: string[]
    description: string
    state: ProposalStateGQ
    totalCurrentVoters: number
    currentYesVote: string
    currentNoVote: string
    currentYesVoteCount?: number
    currentNoVoteCount?: number
    startBlock: string
    endBlock: string
    timestamp: number
    lastUpdateTimestamp: number
    canceledAt?: number
    executedAt?: number
    queueEta?: number
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
    const contractAddress = getGovernanceAddress()

    const query = `
        query get_proposal {
            proposal: proposal(id:"${contractAddress.toLowerCase()}-${id}") {
                proposalId
                proposer
                targets
                values
                calldatas
                description
                state
                totalCurrentVoters
                currentYesVote
                currentYesVoteCount
                currentNoVote
                currentNoVoteCount
                startBlock
                endBlock
                timestamp
                lastUpdateTimestamp
                canceledAt
                executedAt
                queueEta
            }
        }
    `;

    try {
        const data = await request<ProposalResponse>(GRAPH_API_GOVERNANCE, query)

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
    const contractAddress = getGovernanceAddress()

    const query = `
        query get_proposals {
            summary: proposalSummary(id: "${contractAddress.toLowerCase()}") {
                proposalCount
            },
            proposals: proposals(skip: ${skip}, first:${count}, orderBy: timestamp, orderDirection:desc) {
                proposalId
                proposer
                targets
                values
                calldatas
                description
                state
                totalCurrentVoters
                currentYesVote
                currentNoVote
                startBlock
                endBlock
                timestamp
                lastUpdateTimestamp
                canceledAt
                executedAt
                queueEta
            }
        }
    `;

    const data = await request<ProposalsResponse>(GRAPH_API_GOVERNANCE, query)

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
        targets,
        values,
        calldatas,
        description,
        state,
        totalCurrentVoters,
        currentYesVote,
        currentYesVoteCount,
        currentNoVote,
        currentNoVoteCount,
        startBlock,
        endBlock,
        timestamp,
        lastUpdateTimestamp,
        canceledAt,
        executedAt,
        queueEta
    } = proposal

    const [name, body] = description.split(':::')
    return {
        proposalId,
        proposer,
        targets,
        values,
        calldatas,
        description,
        name,
        body,
        state,
        totalCurrentVoters,
        currentYesVote: new BigNumber(currentYesVote),
        currentYesVoteCount,
        currentNoVote: new BigNumber(currentNoVote),
        currentNoVoteCount,
        startBlock: new BigNumber(startBlock).toNumber(),
        endBlock: new BigNumber(endBlock).toNumber(),
        timestamp,
        lastUpdateTimestamp,
        canceledAt,
        executedAt,
        queueEta
    }
}