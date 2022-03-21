import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Card, Flex, Text, Skeleton } from '@pancakeswap/uikit'
import { DeserializedVault } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { getBscScanLink } from 'utils'
import tokens from 'config/constants/tokens'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { getAddress } from 'utils/addressHelpers'
import { getApy } from 'utils/apr'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CardHeading from './CardHeading'
import DetailsSection from './DetailsSection'
import ApyButton from './ApyButton'
import CardActionsContainer from './CardActionsContainer'
import CompoundTimer from './CompoundTimer'

export interface VaultWithStakedValue extends DeserializedVault {
    apr?: number
    lpRewardsApr?: number
    liquidity?: BigNumber
}

const StyledCard = styled(Card)`
align-self: baseline;
`

const VaultCardInnerContainer = styled(Flex)`
    flex-direction: column;
    justify-content: space-around;
    padding: 24px;
`

const ExpandingWrapper = styled.div`
    padding: 24px;
    border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
    overflow: hidden;
`

interface VaultCardProps {
    vault: VaultWithStakedValue
    displayApr: string
    cakePrice?: BigNumber
    account?: string
}

const VaultCard: React.FC<VaultCardProps> = ({ vault, displayApr, cakePrice, account }) => {
    const { t } = useTranslation()
    
    const [showExpandableSection, setShowExpandableSection] = useState(false)

    const totalValueFormatted =
        vault.liquidity && vault.liquidity.gt(0)
            ? `$${vault.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : ''

    const lpLabel = vault.lpSymbol && vault.lpSymbol.toUpperCase().replace('PANCAKE', '')
    
    const liquidityUrlPathParts = getLiquidityUrlPathParts({
        quoteTokenAddress: vault.token.address,
        tokenAddress: tokens.spy.address,
    })
    const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
    const addTokenUrl = `/swap?outputCurrency=${vault.isETH ? 'BNB' : vault.token.address}`
    const lpAddress = getAddress(vault.lpAddresses)
    const [expired, setExpired] = useState(false)

    return (
        <StyledCard>
            <VaultCardInnerContainer>
                <CardHeading
                    symbol={vault.symbol}
                    token={vault.token}
                />
                <Flex justifyContent="space-between" alignItems="center">
                    <Text>{t('APY')}:</Text>
                    <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                        {vault.apr ? (
                            <ApyButton
                                variant="text-and-button"
                                harvestInterval={vault.farm?.harvestInterval}
                                pid={vault.pid}
                                lpSymbol={vault.lpSymbol}
                                multiplier={vault.farm ? vault.farm.multiplier : ''}
                                lpLabel={lpLabel}
                                addLiquidityUrl={addLiquidityUrl}
                                cakePrice={cakePrice}
                                apr={vault.apr}
                                displayApr={displayApr}
                            />
                        ) : (
                            <Skeleton height={24} width={80} />
                        )}
                    </Text>
                </Flex>
                <Flex justifyContent="space-between">
                    <Text>{t('Earn')}:</Text>
                    <Text bold>SPY</Text>
                </Flex>
                <Flex justifyContent="space-between" mt="4px">
                    <Text>{t('Auto compound in')}:</Text>
                    <CompoundTimer 
                        onChangeExpiration={(expired_) => setExpired(expired_)}
                        target={vault ? vault.nearestCompoundingTime.toNumber() : 0} 
                        bold
                    />
                </Flex>

                {vault && expired && (
                    <Flex justifyContent="center">
                        <Text color="warning">
                            {t('All actions(harvest, stake, migrate) are disabled until someone compound. You can compound this pool by clicking "Claim" on the above bounty card')}
                        </Text>
                    </Flex>
                )}

                <CardActionsContainer
                    vault={vault}
                    lpLabel={lpLabel}
                    account={account}
                    cakePrice={cakePrice}
                    addTokenUrl={addTokenUrl}
                    disabled={expired}
                />
            </VaultCardInnerContainer>

            <ExpandingWrapper>
                <ExpandableSectionButton
                    onClick={() => setShowExpandableSection(!showExpandableSection)}
                    expanded={showExpandableSection}
                />
                {showExpandableSection && (
                    <DetailsSection
                        bscScanAddress={getBscScanLink(lpAddress, 'address')}
                        totalValueFormatted={totalValueFormatted}
                        lpLabel={lpLabel}
                        addLiquidityUrl={addLiquidityUrl}
                        contractAddress={getAddress(vault.contractAddresses)}
                        lpAddress={getAddress(vault.lpAddresses)}
                        pid={vault.pid}
                        account={account}
                        disabled={expired}
                    />
                )}
            </ExpandingWrapper>
        </StyledCard>
    )
}

export default VaultCard
