import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Card, Flex, Heading, Text, Button, useModal, Skeleton } from '@pancakeswap/uikit';
import { useTranslation } from 'contexts/Localization';
import ExpandableSectionButton from 'components/ExpandableSectionButton';
import { useNFTSignaturePoolPublicData, useNFTSignaturePoolUserData, usePollNFTAllowanceData, usePollNFTPublicData, usePollNFTSignaturePublicData } from 'state/nft/hooks';
import useInterval from 'hooks/useInterval';
import { getFullDisplayBalance } from 'utils/formatBalance';
import CardHeading from './CardHeading'
import DetailsSection from './DetailsSection'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'

const StyledCard = styled(Card)`
  align-self: baseline;
`

const CardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
`
const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface NFTPoolCardProps {
  account?: string
}

const NFTSignaturePoolCard: React.FC<NFTPoolCardProps> = ({account}) => {
  const { t } = useTranslation()
  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const poolData = useNFTSignaturePoolPublicData()
  const poolUserData = useNFTSignaturePoolUserData()
  const harvestIntervalInHours = poolData ? poolData.harvestInterval / 3600 : 0;
  const harvestFee = poolData ?  poolData.harvestFee.multipliedBy(100).div(10000).toJSON() : 0;
  const totalValueFormatted = poolData ? poolData.totalSupply.toJSON() : undefined;
  const apr = poolData ? poolData.rewardRate.multipliedBy(86400*365).multipliedBy(100).div(poolData.rewardPrecisionFactor) : null

  usePollNFTSignaturePublicData()
  usePollNFTAllowanceData()

  return (
    <StyledCard>
      <CardInnerContainer>
        <CardHeading />
        <Flex justifyContent="space-between" alignItems="center">
          <Text>{t('APY')}:</Text>
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            {apr && poolData ? (
              <ApyButton
                variant="text-and-button"
                harvestInterval={poolData.harvestInterval}
                apr={apr.toNumber()}
                stakedBalance={poolUserData ? poolUserData.balance : null}
              />
            ) : (
              <Skeleton height={24} width={80} />
            )}
          </Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>{t('Total Power Staked')}:</Text>
          {/* <Text>{t('APR will be reset once the countdown is over')}:</Text> */}
          <Text bold>{ account && poolUserData ? getFullDisplayBalance(poolUserData.balance, 0) : '-'}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>{t('Earn')}:</Text>
          <Text bold>{t('SPY')}</Text>
        </Flex>
        {
          harvestIntervalInHours > 0 &&
          <Flex justifyContent="space-between">
            <Text>{t('Harvest Lockup')}:</Text>
            <Text bold>{harvestIntervalInHours} Hour (s)</Text>
          </Flex>
        }
        <Flex justifyContent="space-between">
          <Text>{t('Harvest Fee')}:</Text>
          { harvestFee > 0 ? (
            <Text bold>{harvestFee} %</Text>
          ) : (
            <Text bold>-</Text>
          )}
          
        </Flex>
        <CardActionsContainer account={account} earnings={poolUserData.earning} nextHarvestUntil={poolUserData.nextHarvestUntil}/>
      </CardInnerContainer>

      <ExpandingWrapper>
        <ExpandableSectionButton
          onClick={() => setShowExpandableSection(!showExpandableSection)}
          expanded={showExpandableSection}
        />
        {showExpandableSection && (
          <DetailsSection
            totalValueFormatted={totalValueFormatted}
          />
        )}
      </ExpandingWrapper>
    </StyledCard>
  )
}
  
  export default NFTSignaturePoolCard