
import request, { gql } from "graphql-request";
import { GRAPH_API_SPY_BURN } from "config/constants/endpoints";
import BigNumber from "bignumber.js";
import { BIG_ZERO } from "utils/bigNumber";

export interface Burn {
    id: string
    amount: BigNumber
    from: string
    timestamp: number
    txid: string
    index: number
}

interface BurnFields {
    id: string
    amount: string,
    from: string
    txid: string
    creationTime: string
    index: number
}

interface InfoFields {
    id: string
    totalAmount: string
    count: number
}

interface BurnsQueryResponse {
    burns: BurnFields[]
    infos: InfoFields[]
}

export const SORT_FILED = {
    index: 'index',
    timestamp: 'creationTime'
}

export const SORT_DIRECTION = {
    asc: 'asc',
    desc: 'desc'
}

export const getBurnsByQuery = async (page: number, count: number, orderBy: string, orderDirection: string) : Promise<{burns: Burn[], count: number, total: BigNumber, page: number}> => {

    const query = gql`
        query get_burns {
            infos: infos(first: 1) {
                id
                totalAmount
                count
            }
            burns: burns(first: ${count}, skip: ${page * count}, orderBy:"${orderBy}" orderDirection:${orderDirection}) {
                id
                index
                amount
                from
                txid
                creationTime
            }
        }
    `;

    try {
        const data = await request<BurnsQueryResponse>(GRAPH_API_SPY_BURN, query)
        return {
            burns: data.burns.map((burn) => {
                return {
                    id: burn.id,
                    amount: new BigNumber(burn.amount),
                    timestamp: new BigNumber(burn.creationTime).toNumber(),
                    index: burn.index,
                    txid: burn.txid,
                    from: burn.from
                }
            }),
            total: data.infos.length > 0 ? new BigNumber(data.infos[0].totalAmount) : BIG_ZERO,
            count: data.infos.length > 0 ? data.infos[0].count : 0,
            page
        }

    } catch (error) {
        return {
            burns: [],
            count: 0,
            total: BIG_ZERO,
            page: 0
        }
    }
}