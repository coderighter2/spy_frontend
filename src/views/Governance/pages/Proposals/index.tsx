import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex, Box, Skeleton } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import Page from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { useGovernanceDevAddress, usePollGovernancePublicData } from 'state/governance/hooks'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { ProposalData } from '../../types'
import { queryProposals } from '../../hooks/queryProposal'
import ProposalRow from './ProposalRow'
import { useProposalAdmin } from '../../hooks/getProposal'

const HeaderOuter = styled(Box)<{ background?: string }>`
  background: ${({ theme, background }) => background || theme.colors.gradients.bubblegum};
`

const HeaderInner = styled(Container)`
  padding-top: 32px;
`

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    padding: 24px 0px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const NUMBER_OF_ITEMS_VISIBLE = 8

const Proposals: React.FC = () => {

    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const devAddr = useGovernanceDevAddress()
    const [proposals, setProposals] = useState<ProposalData[]>([])
    const { observerRef, isIntersecting } = useIntersectionObserver()
    const [numberOfItemsVisible, setNumberOfItemsVisible] = useState(0)
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)

    const [checkingAdmin, isAdmin] = useProposalAdmin()
    
    const totalProposalCount = useRef(0)

    useEffect(() => {
        if (isIntersecting) {
            setNumberOfItemsVisible((itemsCurrentlyVisible) => {
                if (itemsCurrentlyVisible <= totalProposalCount.current) {
                    return Math.min(itemsCurrentlyVisible + NUMBER_OF_ITEMS_VISIBLE, totalProposalCount.current)
                }
                return itemsCurrentlyVisible
            })
        }
    }, [isIntersecting])



    useEffect(() => {
        const loadProposals = async() => {
            try {
                setLoading(true)
                if (initialized) {
                    if (numberOfItemsVisible > proposals.length) {
                        const {items, totalCount} = await queryProposals(proposals.length, numberOfItemsVisible - proposals.length)
                        setProposals([...proposals, ...items])
                        totalProposalCount.current = totalCount
                    }
                } else {
                    const {items, totalCount} = await queryProposals(0, NUMBER_OF_ITEMS_VISIBLE)
                    if (items) {
                        setProposals(items)
                        setNumberOfItemsVisible(items.length)
                        totalProposalCount.current = totalCount
                    }
                }
            } catch (e) {
                console.log(e)
            } finally {
                setInitialized(true)
                setLoading(false)
            }
        }

        if (loading) {
            return
        }

        if (!initialized || numberOfItemsVisible > proposals.length) {
            loadProposals()
        }
    }, [initialized, loading, proposals, numberOfItemsVisible])

    usePollGovernancePublicData()

    return (
        <>
            <HeaderOuter>
                <HeaderInner>
                    <Flex flexDirection="column">
                        <Flex justifyContent="space-between">
                            <Heading scale="xl" color="secondary" mb="12px">
                                {t('Governance Proposals')}
                            </Heading>
                            { isAdmin && (
                                <Button as={Link} to="/governance/create">
                                    {t('Create')}
                                </Button>
                            )}
                        </Flex>
                        <Text color="text" width={["100%", null, null, "80%"]}>
                            {t('On-chain governance is a system for managing and implementing changes to cryptocurrency blockchains. In this type of governance, rules for instituting changes are encoded into the blockchain protocol. Developers propose changes through code updates and each node votes on whether to accept or reject the proposed change')}
                        </Text>
                    </Flex>
                </HeaderInner>
            </HeaderOuter>

            <Page>

                <Wrapper>
                    <Heading mb="24px" paddingX={["24px", null, null, "48px"]}>
                        {t('Proposal List')}
                    </Heading>
                    <Flex flexDirection="column">
                        { proposals.map((proposal) => {
                            return (
                                <ProposalRow key={proposal.proposalId} proposal={proposal} />
                            )
                        })}
                    </Flex>
                    <div ref={observerRef} />
                    {loading && (
                        <Skeleton width="100%" height="300px" animation="waves"/>
                    )}
                </Wrapper>
            </Page>
        </>
    )
}


export default Proposals