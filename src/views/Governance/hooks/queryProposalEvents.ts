import BigNumber from "bignumber.js";
import { GRAPH_API_GOVERNANCE } from 'config/constants/endpoints';
import request from "graphql-request"
import { getGovernanceAddress } from 'utils/addressHelpers';
import { ProposalEvent, ProposalStateGQ } from '../types';

interface HistoryResponse {
    id: string
    timestamp: number
    state: ProposalStateGQ
    txid: string
}

interface HistoriesResponse {
    history: HistoryResponse[]
}


export const queryProposalEvents = async(proposalId: string): Promise<ProposalEvent[]> => {
    const contractAddress = getGovernanceAddress()

    const query = `
        query get_proposal_history {
            history: proposalEvents(first: 10, where: {proposal: "${contractAddress.toLowerCase()}-${proposalId}"}, orderBy: timestamp, orderDirection:asc) {
                id
                timestamp
                state
                txid
            },
        }
    `;
    const data = await request<HistoriesResponse>(GRAPH_API_GOVERNANCE, query)

    return data.history.map((history) => {
        return {
            ...history
        }
    })
}