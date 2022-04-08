import React, { lazy } from 'react'
import { Route } from 'react-router-dom'


const CreateProposalPage = lazy(() => import('./pages/CreateProposal'))
const ProposalPage = lazy(() => import('./pages/ProposalPage'))
const ProposalsPage = lazy(() => import('./pages/Proposals'))

const Governance: React.FC = () => {
  return (
    <>
      <Route exact path="/governance/proposals" component={ProposalsPage} />
      <Route exact path="/governance/proposal/:id" component={ProposalPage} />
      <Route exact path="/governance/create" component={CreateProposalPage} />
    </>
  )
}

export default Governance
