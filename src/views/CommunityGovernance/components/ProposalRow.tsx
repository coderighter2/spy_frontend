import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Text, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { useBlock } from 'state/block/hooks'
import { BIG_ZERO } from 'utils/bigNumber'
import { useGovernanceQuorum } from 'state/governance/hooks'
import { ProposalData, ProposalStateGQ } from '../types'


const LinkWrapper = styled(Link)`

    text-decoration: none;
    :hover {
        cursor: pointer;
        opacity: 0.7;
    }

    > div > div {
        border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
    }

    &:first-child > div > div {
        border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
    }
`

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    &:hover {
        background: rgba(100, 100, 100, 0.1);
    }
`

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

interface ProposalRawProps {
    proposal: ProposalData
}

const ProposalRow: React.FC<ProposalRawProps> = ({proposal}) => {

    const { t } = useTranslation()
    const { theme } = useTheme()

    const state = useMemo(() => {

        let res = proposal.state
        if (res === ProposalStateGQ.Pending && proposal.startTime < new Date().getTime() / 1000) {
            res = ProposalStateGQ.Active
        }

        if (res === ProposalStateGQ.Active && proposal.endTime < new Date().getTime() / 1000) {
            res = proposal.currentYesVote.lte(proposal.currentNoVote) ? ProposalStateGQ.Failed : ProposalStateGQ.Succeeded
        }
        return res
    }, [proposal])

    const stateColor = useMemo(() => {
        switch(state) {
            case ProposalStateGQ.Succeeded:
                return theme.colors.success
            case ProposalStateGQ.Executed:
                return theme.colors.success
            case ProposalStateGQ.Canceled:
                return theme.colors.failure
            case ProposalStateGQ.Failed:
                return theme.colors.failure
            case ProposalStateGQ.Queued:
                return theme.colors.secondary
            case ProposalStateGQ.Active:
                return theme.colors.primary
            case ProposalStateGQ.Pending:
                return theme.colors.text
            default:
                return theme.colors.text
        }
    }, [state, theme])

    const voteStatus = useMemo(() => {
        if (proposal.currentYesVote.eq(BIG_ZERO) && proposal.currentNoVote.eq(BIG_ZERO)) {
            return t('No Votes')
        }
        if (proposal.currentYesVote.gt(proposal.currentNoVote)) {
            return t('Passed')
        }
        return t('Failed')
    }, [t, proposal.currentYesVote, proposal.currentNoVote])

    const voteStatusColor = useMemo(() => {
        if (proposal.currentYesVote.eq(BIG_ZERO) && proposal.currentNoVote.eq(BIG_ZERO)) {
            return theme.colors.secondary
        }
        if (proposal.currentYesVote.gt(proposal.currentNoVote)) {
            return theme.colors.success
        }
        return theme.colors.failure
    }, [theme, proposal.currentYesVote, proposal.currentNoVote])

    return (
        <LinkWrapper to={`/governance/community/${proposal.proposalId}`} key={proposal.proposalId}>
            <Wrapper>
                <Flex flexDirection={["column", null, null, "row"]} marginX={["24px", null, null, "48px"]} paddingY="12px">
                    <Flex flex="1" flexDirection="column">
                        <Text fontSize="14px" bold>
                            {proposal.name}
                        </Text>
                        <Flex justifyContent="start" alignItems="center" mt="4px">
                            <VoteStatus statusColor={voteStatusColor}>{voteStatus}</VoteStatus>
                            <VotesCount mx="12px">{proposal.totalCurrentVoters}</VotesCount>
                            <Text>{format(proposal.timestamp * 1000, 'MM/dd/yy h:mm a')}</Text>
                        </Flex>
                    </Flex>
                    <Flex alignItems="center" marginTop={["8px", null, null, "0px"]}>
                        <Text color={stateColor} >{state}</Text>
                    </Flex>
                </Flex>
            </Wrapper>
        </LinkWrapper>
    )
}


export default ProposalRow