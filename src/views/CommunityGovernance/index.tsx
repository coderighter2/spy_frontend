import React, { lazy } from 'react'
import { Route } from 'react-router-dom'


const CreateProposalPage = lazy(() => import('./pages/CreateProposal'))
const ProposalPage = lazy(() => import('./pages/ProposalPage'))
const ProposalsPage = lazy(() => import('./pages/Proposals'))

const CommunityGovernance: React.FC = () => {
  return (
    <>
    </>
  )
}

export default CommunityGovernance
