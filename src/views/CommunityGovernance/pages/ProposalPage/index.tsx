import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouteMatch, RouteComponentProps, Link } from 'react-router-dom'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { Breadcrumbs, Button, ChevronRightIcon, Flex, Heading, LogoIcon, Skeleton, Text } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import useToast from 'hooks/useToast'
import useRefresh from 'hooks/useRefresh'
import { useTranslation } from 'contexts/Localization'
import { Proposal, ProposalData } from '../../types'
import { queryProposalById } from '../../hooks/queryProposal'
import ProposalHeader from './ProposalHeader'
import Votes from './Votes'
import ProposalAction from './ProposalAction'
import useGetProposal from '../../hooks/getProposal'
import ProposalDetail from './ProposalDetail'
import ProposalAdminAction from './ProposalAdminAction'
import ProposalHistory from './ProposalHistory'



const ProposalPage: React.FC<RouteComponentProps<{id: string}>> = ({
    match: {
        params: {id: proposalId}
    }
}) => {
    const { t } = useTranslation()
    const { path } = useRouteMatch()
    const { account } = useWeb3React()
    const { slowRefresh } = useRefresh()
    const { toastError, toastSuccess } = useToast()
    const [canceling, setCanceling] = useState(false)
    const [proposal, setProposal] = useState<Proposal|null>(null)
    const [proposalData, setProposalData] = useState<ProposalData|null>(null)
    const [loaded, setLoaded] = useState(false)

    const {onGetProposal} = useGetProposal()

    const isProposer = useMemo(() => {
        return account && proposal && account.toLowerCase() === proposal.proposer.toLowerCase()
    }, [proposal, account])

    const reloadProposal = useCallback(async () => {
        const proposal_ = await onGetProposal(proposalId)
        setProposal(proposal_)

        queryProposalById(proposalId).then((data) => {
            setProposalData(data)
        })
    }, [proposalId, onGetProposal])

    useEffect(() => {
        const loadProposal = async() => {
            try {
                const proposal_ = await onGetProposal(proposalId)
                setProposal(proposal_)

                queryProposalById(proposalId).then((data) => {
                    setProposalData(data)
                })
            } finally {
                setLoaded(true)
            }
        }

        loadProposal()
    }, [loaded, proposalId, onGetProposal, slowRefresh])

    if (proposalId === 'create') {
        return (<></>)
    }

    return (
        <>
            <Page>
                <Flex flexDirection="column">
                    { !loaded ? (
                        <Skeleton width="100%" height="400px" animation="waves"/>
                    ) 
                    : !proposal ? (
                        <Flex flexDirection="column" alignItems="center">
                            <LogoIcon width="64px" mb="8px" />
                            <Heading scale="xxl">404</Heading>
                            <Text mb="16px">{t('Oops, page not found.')}</Text>
                            <Button as={Link} to="/" scale="sm">
                            {t('Back Home')}
                            </Button>
                        </Flex>
                    )
                    : (
                        <>
                        <Flex style={{padding: "12px 0px"}}>
                            <Breadcrumbs mb="32px" separator={<ChevronRightIcon color="secondary" width="24px" />}>
                            <Link to="/governance/community">
                                <Text color="secondary">{t('Governance')}</Text>
                            </Link>
                            <Flex>
                                <Text mr="8px" color="primary"> {proposalData ? proposalData.name : ''}</Text>
                            </Flex>
                            </Breadcrumbs>
                        </Flex>
                        <Flex flexDirection={["column", null, null, "row"]} justifyContent={[null, null, null, "space-between"]}>
                            <ProposalHeader 
                                proposal={proposal}
                                name={proposalData?.name}
                                creationTime={proposalData?.timestamp}
                                votesCount={proposalData?.totalCurrentVoters}
                                />
                            {isProposer && (
                                <ProposalAdminAction 
                                    proposalId={proposalId}
                                    proposal={proposal}
                                    reloadProposal={reloadProposal}
                                />
                            )}
                            <ProposalAction 
                                proposal={proposal}
                                proposalId={proposalId}
                            />
                        </Flex>
                        
                        <Votes proposal={proposalData}/>

                        <Flex flexDirection={["column", null, null, "row"]}>
                            <Flex flex="1" flexDirection="column" mr={[null, null, null, "12px"]}>
                                <ProposalDetail body={proposalData?.body}/>
                            </Flex>
                            <Flex flex="1" ml={[null, null, null, "12px"]}>
                                <ProposalHistory proposalId={proposalId} proposal={proposal}/>
                            </Flex>
                        </Flex>
                        </>
                    )}
                </Flex>
            </Page>
        </>
    )
}

export default ProposalPage