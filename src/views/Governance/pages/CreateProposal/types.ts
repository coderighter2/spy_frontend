import { ProposalCommand } from "../../types";


export interface FormState {
    name: string
    body: string
    targetApy?: string
    apyMultiplier?: string
    command: ProposalCommand
    nftRefillAmount?: string
    apyHarvestInterval?: string
}