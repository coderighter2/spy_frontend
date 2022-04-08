import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Text, Flex, Heading } from '@pancakeswap/uikit'
import { BSC_BLOCK_TIME } from 'config'
import { useTranslation } from 'contexts/Localization'
import { simpleRpcProvider } from 'utils/providers'
import useRefresh from 'hooks/useRefresh'
import useTheme from 'hooks/useTheme'
import { useBlock } from 'state/block/hooks'
import { Proposal, ProposalData, ProposalState, ProposalStates } from '../../types'


const VoteStatus = styled(Text)<{statusColor: string}>`
    font-size: 14px;
    padding: 4px 8px;
    color: ${({ statusColor }) => statusColor};
    border: 1px solid ${({ statusColor }) => statusColor};
    border-radius: 8px;
`

const VotesCount = styled(Text)`
    font-size: 14px;
    padding: 4px 12px;
    text-align: center;
    min-width: 40px;
    border-radius: 8px;
    background: #4A5568;
    color: white;
`

interface ProposalHeaderProps {
    name?: string
    proposal: Proposal
    creationTime?: number
    votesCount?: number
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({name, proposal, votesCount, creationTime}) => {

    const { t } = useTranslation()
    const { currentBlock } = useBlock()
    const { theme } = useTheme()
    const { slowRefresh } = useRefresh()
    const [endTimestamp, setEndTimestamp] = useState(0)

    const stateColor = useMemo(() => {
        switch(proposal.state) {
            case ProposalState.Succeeded:
                return theme.colors.success
            case ProposalState.Executed:
                return theme.colors.success
            case ProposalState.Canceled:
                return theme.colors.failure
            case ProposalState.Defeated:
                return theme.colors.failure
            case ProposalState.Queued:
                return theme.colors.secondary
            case ProposalState.Active:
                return theme.colors.primary
            case ProposalState.Pending:
                return theme.colors.text
            default:
                return theme.colors.text
        }
    }, [proposal.state, theme])

    const proposalStatus = useMemo(() => {
        return ProposalStates[proposal.state]
    }, [proposal.state])

    useEffect(() => {
        const fetchEndBlock = async () => {
            const block = await simpleRpcProvider.getBlock(proposal.endBlock)
            if (block) {
                setEndTimestamp(block.timestamp)
            }
        }

        if (proposal && endTimestamp === 0 && currentBlock > proposal.endBlock) {
            fetchEndBlock()
        }
        
    }, [slowRefresh, proposal, endTimestamp, currentBlock])

    const endTime = useMemo(() => {
        if (!proposal) {
            return 0
        }

        if (currentBlock < proposal.endBlock) {
            return new Date().getTime() / 1000 + BSC_BLOCK_TIME * (proposal.endBlock - currentBlock)
        }

        return endTimestamp
    }, [proposal, currentBlock, endTimestamp])

    return (
        <Flex flexDirection="column">
            <Heading scale="xl">
                {name ?? `${proposal.proposalId.substring(0, 10)}...`}
            </Heading>
            <Flex justifyContent="start" alignItems="center" mt="4px">
                <VoteStatus statusColor={stateColor}>{proposalStatus}</VoteStatus>
                {!!votesCount && (
                    <VotesCount ml="12px">{votesCount}</VotesCount>
                )}
                <Text ml="12px">{creationTime && format(creationTime * 1000, 'MM/dd/yy h:mm a')}</Text>
                {endTime > 0 && (
                    <>
                    <Text ml="8px">-</Text>
                    <Text ml="8px">{format(endTime * 1000, 'MM/dd/yy h:mm a')}</Text>
                    </>
                )}
            </Flex>
        </Flex>
    )
}


export default ProposalHeader