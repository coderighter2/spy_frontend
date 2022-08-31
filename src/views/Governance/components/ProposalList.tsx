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
import { ProposalData } from '../types'
import { queryProposals } from '../hooks/queryProposal'
import ProposalRow from './ProposalRow'
import { useProposalAdmin } from '../hooks/getProposal'

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    padding: 24px 0px;
    border-radius: 0px 0px 12px 12px;
    background: white;
`

const NUMBER_OF_ITEMS_VISIBLE = 8

const ProposalList: React.FC = () => {

    const { t } = useTranslation()
    const [proposals, setProposals] = useState<ProposalData[]>([])
    const { observerRef, isIntersecting } = useIntersectionObserver()
    const [numberOfItemsVisible, setNumberOfItemsVisible] = useState(0)
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)
    
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

        <Wrapper>
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
    )
}


export default ProposalList