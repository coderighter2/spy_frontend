import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex, Box } from '@pancakeswap/uikit'
import styled from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { getLpTokenPrice, useFarms, usePollFarmsPublicData, usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { DeserializedFarm, DeserializedVault, SerializedVault } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import PageHeader from 'components/PageHeader'
import Loading from 'components/Loading'
import Container from 'components/Layout/Container'
import { BIG_ZERO } from 'utils/bigNumber'
import { getFarmApr } from 'utils/apr'
import { getBalanceAmount } from 'utils/formatBalance'
import { usePollVaultsWithUserData, useVaults } from 'state/vaults/hooks'
import VaultCard, { VaultWithStakedValue } from './components/VaultCard/VaultCard'
import VaultBountyCard from './components/VaultBountyCard'
import EmptyVaultBountyCard from './components/VaultBountyCard/EmptyVaultBountyCard'
import HelpButton from './HelpButton'

const HeaderOuter = styled(Box)<{ background?: string }>`
  background: ${({ theme, background }) => background || theme.colors.gradients.bubblegum};
`

const HeaderInner = styled(Container)`
  padding-top: 32px;
`

const StyledWrapper = styled(Flex).attrs({flexDirection:"column"})`
  align-self: baseline;
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

  const activeCompoundingVault = useMemo<DeserializedVault | undefined>(() => {
    if (!vaults) return undefined
    const sortedVault = vaults.filter(vault => {
      return vault.nearestCompoundingTime && vault.nearestCompoundingTime.gt(0)
    }).sort((vault1, vault2) => {
      return vault1.nearestCompoundingTime.gt(vault2.nearestCompoundingTime) ?  1 : -1
    })
    if (sortedVault.length > 0) {
      return sortedVault[0]
    }
    return undefined
  }, [vaults])

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
      <HeaderOuter>
        <HeaderInner>

          <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
            <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
              <Heading scale="xl" color="secondary" mb="12px">
                {t('The Auto')}
              </Heading>
              <Text color="text">
                {t('Stake Tokens to earn with Automatic Compounding. Users can stake one Token with other users to earn SPY. Refer your friends to earn 5% on their extra rewards.')}
              </Text>
            </Flex>
            <Flex flex="1" height="fit-content" justifyContent={["center", null, null, "flex-end"]} alignItems="center" mt={['24px', null, '0']}>
              {/* <HelpButton /> */}
              {activeCompoundingVault ? (
                <VaultBountyCard 
                  vault={activeCompoundingVault}
                  cakePrice={cakePrice}
                />
              ) : (
                <EmptyVaultBountyCard/>
              )}
            </Flex>
          </Flex>
        </HeaderInner>
      </HeaderOuter>
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
