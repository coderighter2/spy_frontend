import { ProposalCommand } from "../../types";


export interface FormState {
    name: string
    body: string
    targetApy?: string
    command: ProposalCommand
    nftRefillAmount?: string
}