import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Heading, Text, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import VotesGroup from './VotesGroup'
import { ProposalData, VoteData } from '../../types'
import { queryVotes } from '../../hooks/queryVotes'

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    margin-top: 24px;
    padding: 24px 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;

    ${({ theme }) => theme.mediaQueries.md} {
        padding: 24px 24px;
    }
`

const StatsGroup = styled(Flex)`

    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    border-radius: 12px;

    ${({ theme }) => theme.mediaQueries.md} {
        border: unset;
    }
`

const Stats = styled(Flex).attrs({flexDirection:"column"})`
    padding: 4px;
    flex: 1;

    ${({ theme }) => theme.mediaQueries.md} {
        margin: 0px 4px;
        padding: 8px;
        min-width: 140px;
        border-radius: 12px;
        border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    }
`

const StatsValue = styled(Text)`
`

interface VotesProps {
    proposal?: ProposalData
}

const Votes: React.FC<VotesProps> = ({proposal}) => {

    const { t } = useTranslation()
    const [votesLoaded, setVotesLoaded] = useState(false)
    const [forVotes, setForVotes] = useState<VoteData[]>([])
    const [againstVotes, setAgainstVotes] = useState<VoteData[]>([])

    useEffect(() => {
        const fetchVotes = async () => {

            const {forVotes: forVotes_, againstVotes: againstVotes_} = await queryVotes(proposal.proposalId)
            setForVotes(forVotes_)
            setAgainstVotes(againstVotes_)
            setVotesLoaded(true)
        }
        if (proposal) {
            fetchVotes()
        }
    }, [proposal])

    const forPercent = useMemo(() => {
        if (proposal) {
            const percent = proposal.currentYesVote.dividedBy(proposal.currentYesVote.plus(proposal.currentNoVote)).multipliedBy(100)
            return Math.round(percent.toNumber())
        }
        return 0;
    }, [proposal])

    const againstPercent = useMemo(() => {
        if (proposal) {
            const percent = proposal.currentNoVote.dividedBy(proposal.currentYesVote.plus(proposal.currentNoVote)).multipliedBy(100)
            return Math.round(percent.toNumber())
        }
        return 0;
    }, [proposal])

    return (
        <Wrapper>
            <Flex 
                flexDirection={["column", null, null, "row"]} 
                alignItems={["left", null, null, "center"]} 
                padding={["8px", null, null, "16px"]}
            >
                <Flex flex="1">
                    <Heading paddingY="12px">
                        {t('List of Votes')}
                    </Heading>
                </Flex>

                <StatsGroup>
                    <Stats>
                        <Text>{t('Total (Address)')}</Text>
                        <StatsValue>{proposal?.totalCurrentVoters ?? 0}</StatsValue>
                    </Stats>
                    <Stats>
                        <Text color="success">{t('For')}</Text>
                        <StatsValue>{proposal?.currentYesVoteCount ?? 0}</StatsValue>
                    </Stats>
                    <Stats>
                        <Text color="failure">{t('Against')}</Text>
                        <StatsValue>{proposal?.currentNoVoteCount ?? 0}</StatsValue>
                    </Stats>
                </StatsGroup>

            </Flex>

            <Flex flexDirection={["column", null, null, "row"]} alignItems="center">
                <Flex flex="1" flexDirection="column" width={["100%", null, null, "auto"]}>
                    <VotesGroup 
                        totalWeight={proposal?.currentYesVote.plus(proposal?.currentNoVote)}
                        voteAddressCount={proposal?.currentYesVoteCount}
                        isFor
                        votes={forVotes}
                        percent={forPercent}
                    />
                </Flex>
                <Flex flex="1" flexDirection="column" width={["100%", null, null, "auto"]}>
                    <VotesGroup 
                        totalWeight={proposal?.currentYesVote.plus(proposal?.currentNoVote)}
                        voteAddressCount={proposal?.currentNoVoteCount}
                        votes={againstVotes}
                        percent={againstPercent}
                    />
                </Flex>
                
            </Flex>

        </Wrapper>
    )
}


export default Votes