import React, { useState } from 'react'
import { Route} from 'react-router-dom'
import { usePollSwapPoolData } from 'state/swapPool/hooks'
import BrowsePools from './components/BrowsePools/BrowsePools'
import CreatePool from './components/CreatePool/CreatePool'
import ViewPool from './components/ViewPool/ViewPool'

const SwapPools: React.FC = () => {
    usePollSwapPoolData()

    return (
        <>
          <Route exact path="/swap-pools" component={BrowsePools} />
          <Route exact path="/swap-pools/create" component={CreatePool} />
          <Route exact path="/swap-pools/view/:address" component={ViewPool} />
        </>
    )
}

export default SwapPools