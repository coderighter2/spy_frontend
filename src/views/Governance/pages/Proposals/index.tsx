import React from 'react'
import { Link, Route, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex, Box, Skeleton } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import Page from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { usePollGovernancePublicData } from 'state/governance/hooks'
import { TabToggle, TabToggleGroup } from 'components/TabToggle'
import CommunityProposalList from 'views/CommunityGovernance/components/ProposalList'
import CoreProposalList from '../../components/ProposalList'
import { useProposalAdmin } from '../../hooks/getProposal'

const HeaderOuter = styled(Box)<{ background?: string }>`
  background: ${({ theme, background }) => background || theme.colors.gradients.bubblegum};
`

const HeaderInner = styled(Container)`
  padding-top: 32px;
`

const Proposals: React.FC = () => {

    const { t } = useTranslation()

    const [checkingAdmin, isAdmin] = useProposalAdmin()
    const { pathname } = useLocation()
    const history = useHistory()
    const isCore = pathname.includes('core')

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
                            <Flex>
                            { isAdmin && (
                                <Button as={Link} to="/governance/core/create" mr="8px">
                                    {t('Create Core Proposal')}
                                </Button>
                            )}
                            <Button as={Link} to="/governance/community/create">
                                {t('Create')}
                            </Button>
                            </Flex>
                        </Flex>
                        <Text color="text" width={["100%", null, null, "80%"]}>
                            {t('Users now can join to vote for particular proposals created by the project developers or directly create their own proposals for the ecosystem\'s improvement')}
                        </Text>
                    </Flex>
                </HeaderInner>
            </HeaderOuter>

            <Page>

                <TabToggleGroup>
                    <TabToggle isActive={isCore} onClick={() => {
                        if (!isCore) {
                            history.push('/governance/core')
                        }
                    }}>
                        <Text>{t('Core')}</Text>
                    </TabToggle>
                    <TabToggle isActive={!isCore} onClick={() => {
                        if (isCore) {
                            history.push('/governance/community')
                        }
                    }}>
                        <Text>{t('Community')}</Text>
                    </TabToggle>
                </TabToggleGroup>
                <Route exact path="/governance/core" component={CoreProposalList}/>
                <Route exact path="/governance/community" component={CommunityProposalList}/>
            </Page>
        </>
    )
}


export default Proposals