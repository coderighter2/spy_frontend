import React, { lazy } from 'react'
import { Route } from 'react-router-dom'


const CreateProposalPage = lazy(() => import('./pages/CreateProposal'))
const ProposalPage = lazy(() => import('./pages/ProposalPage'))
const ProposalsPage = lazy(() => import('./pages/Proposals'))
const CreateCommunityProposalPage = lazy(() => import('views/CommunityGovernance/pages/CreateProposal'))
const CommunityProposalPage = lazy(() => import('views/CommunityGovernance/pages/ProposalPage'))

const Governance: React.FC = () => {
  return (
    <>
      <Route exact path="/governance/core" component={ProposalsPage} />
      <Route exact path="/governance/core/create" component={CreateProposalPage} />
      <Route exact path="/governance/core/:id" component={ProposalPage} />
      <Route exact path="/governance/community" component={ProposalsPage} />
      <Route exact path="/governance/community/create" component={CreateCommunityProposalPage} />
      <Route exact path="/governance/community/:id" component={CommunityProposalPage} />
    </>
  )
}

export default Governance
