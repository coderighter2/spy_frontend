import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Text, Flex, Heading, LinkExternal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useRefresh from 'hooks/useRefresh'
import truncateHash from 'utils/truncateHash'
import { useBlock } from 'state/block/hooks'
import { simpleRpcProvider } from 'utils/providers'
import { getBscScanLink } from 'utils'
import { Proposal, ProposalData, ProposalEvent, ProposalState, ProposalStateGQ, ProposalStates } from '../../types'
import { queryProposalEvents } from '../../hooks/queryProposalEvents'

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    width: 100%;
    margin-top: 24px;
    padding: 24px 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;

    ${({ theme }) => theme.mediaQueries.sm} {
        padding: 24px 24px;
    }
`

const TransactionLink = styled(LinkExternal)`
    font-size: 14px;
`

interface ProposalHeaderProps {
    proposalId: string
    proposal?: Proposal
    data?: ProposalData
}

const ProposalHistory: React.FC<ProposalHeaderProps> = ({ proposalId, proposal, data }) => {

    const { t } = useTranslation()
    const [events, setEvents] = useState<ProposalEvent[]>([])
    const { slowRefresh } = useRefresh()
    const {currentBlock} = useBlock()
    const [endTimestamp, setEndTimestamp] = useState(0)
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)

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

    useEffect(() => {
        const loadHistory = async() => {
            try {
                setLoading(true)
                const items = await queryProposalEvents(proposalId)
                setEvents(items)
            } catch (e) {
                console.log(e)
            } finally {
                setInitialized(true)
                setLoading(false)
            }
        }

        loadHistory()
    }, [slowRefresh, proposalId])

    return (
        <Wrapper>
            <Flex flexDirection="column">
                <Heading paddingY="12px">
                    {t('Proposal History')}
                </Heading>
            </Flex>

            <Flex flexDirection="column">
                {events.map((event) => {
                    return (
                        <Flex key={event.id} alignItems="center" my="8px">
                            <Flex flex="1" flexDirection="column">
                                <Text color="secondary" fontSize="14px">{event.state}</Text>
                                { event.state === ProposalStateGQ.Succeeded ? (
                                    <Text fontSize="12px">{format(new Date(endTimestamp > 0 ? endTimestamp * 1000 : event.timestamp * 1000), 'MMMM dd yyyy hh:mm aa')}</Text>
                                ) : (
                                    <Text fontSize="12px">{format(new Date(event.timestamp * 1000), 'MMMM dd yyyy hh:mm aa')}</Text>
                                )}
                            </Flex>
                            {event.txid && event.state !== ProposalStateGQ.Succeeded && (
                                <TransactionLink href={getBscScanLink(event.txid, 'transaction')}>{truncateHash(event.txid)}</TransactionLink>
                            )}
                        </Flex>
                    )
                })}

                {proposal && proposal.state === ProposalState.Defeated && (
                    <Flex alignItems="center" my="8px">
                        <Flex flex="1" flexDirection="column">
                            <Text color="secondary" fontSize="14px">{ProposalStates[ProposalState.Defeated]}</Text>
                            <Text fontSize="12px">{endTimestamp > 0 ? format(new Date(endTimestamp * 1000), 'MMMM dd yyyy hh:mm aa') : ''}</Text>
                        </Flex>
                    </Flex>
                )}

                {proposal && proposal.state === ProposalState.Succeeded && (
                    <Flex alignItems="center" my="8px">
                        <Flex flex="1" flexDirection="column">
                            <Text color="secondary" fontSize="14px">{ProposalStates[ProposalState.Succeeded]}</Text>
                            <Text fontSize="12px">{endTimestamp > 0 ? format(new Date(endTimestamp * 1000), 'MMMM dd yyyy hh:mm aa') : ''}</Text>
                        </Flex>
                    </Flex>
                )}
            </Flex>
        </Wrapper>
    )
}


export default ProposalHistory