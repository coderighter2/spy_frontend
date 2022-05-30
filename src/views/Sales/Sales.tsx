import React, { useState } from 'react'
import { Route, RouteComponentProps, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { Flex, Heading, SubMenuItems, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { usePollLaunchpadData } from 'state/launchpad/hooks'
import { useTranslation } from 'contexts/Localization'
import ViewSales from './components/ViewSales/ViewSales'
import CreateSale from './components/CreateSale/CreateSale'
import SalePage from './components/SalePage/SalePage'

const Sales: React.FC = () => {

    const { t } = useTranslation()
    const { pathname } = useLocation()


    usePollLaunchpadData()

    return (
        <>
          <Route exact path="/sales" component={ViewSales} />
          <Route exact path="/sales/create" component={CreateSale} />
          <Route exact path="/sales/view/:address" component={SalePage} />
        </>
    )
}

export default Sales