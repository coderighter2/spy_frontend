import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { getLpTokenPrice, useFarms, usePollFarmsPublicData, usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { DeserializedFarm, DeserializedVault } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import Loading from 'components/Loading'
import { BIG_ZERO } from 'utils/bigNumber'
import { getFarmApr } from 'utils/apr'
import { getBalanceAmount } from 'utils/formatBalance'
import { usePollVaultsWithUserData, useVaults } from 'state/vaults/hooks'
import VaultCard, { VaultWithStakedValue } from './components/VaultCard/VaultCard'

const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`

const StyledImage = styled(Image)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 58px;
`

const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Vaults: React.FC = () => {
  const { path } = useRouteMatch()
  const { t } = useTranslation()
  const { data: vaults, userDataLoaded } = useVaults()
  const { data: farms } = useFarms()
  const cakePrice = usePriceCakeBusd()
  const { account } = useWeb3React()

  usePollVaultsWithUserData()
  usePollFarmsPublicData()

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const vaultsList = useCallback(
    (vaulstToDisplay: DeserializedVault[]): VaultWithStakedValue[] => {
      const vaultsToDisplayWithAPR: VaultWithStakedValue[] = vaulstToDisplay.map((vault) => {
        const farm = farms.find((f) => f.pid === vault.pid)
        if (!farm) {
          return vault
        }
        const lpPrice = getLpTokenPrice(farm)
        const totalLiquidity = vault.totalSupply ? getBalanceAmount(vault.totalSupply).multipliedBy(lpPrice) : BIG_ZERO
        const { cakeRewardsApr, lpRewardsApr } = getFarmApr(new BigNumber(farm.poolWeight).multipliedBy(vault.totalSupply).dividedBy(farm.lpTotalSupply), farm.spyPerBlock, cakePrice, totalLiquidity, farm.lpAddresses[parseInt(process.env.REACT_APP_CHAIN_ID, 10)])

        return {...vault, farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity}
      })
      return vaultsToDisplayWithAPR
    },
    [farms, cakePrice],
  )

  const vaultsToDisplay = useMemo(() => {
    return vaultsList(vaults)
  }, [vaults, vaultsList])

  const renderContent = (): JSX.Element => {
    return (
      <FlexLayout>
        {vaultsToDisplay.map((vault) => (
          <VaultCard
            key={vault.pid}
            vault={vault}
            displayApr={getDisplayApr(vault.apr, vault.lpRewardsApr)}
            cakePrice={cakePrice}
            account={account}
          />
        ))}
      </FlexLayout>
    )
  }

  return (
    <>
      <Page>
        {renderContent()}
        {account && !userDataLoaded && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
      </Page>
    </>
  )
}

export default Vaults
