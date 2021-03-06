import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, IconButton, useModal, CalculateIcon } from '@pancakeswap/uikit'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { useTranslation } from 'contexts/Localization'
import { useLpTokenPrice } from 'state/farms/hooks'
import { getApy } from 'utils/apr'
import { useVaultUser } from 'state/vaults/hooks'

const ApyLabelContainer = styled(Flex)`
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }
`

export interface ApyButtonProps {
  variant: 'text' | 'text-and-button'
  pid: number
  isOld?: boolean
  lpSymbol: string
  lpLabel?: string
  multiplier: string
  cakePrice?: BigNumber
  harvestInterval?: BigNumber
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
}

const ApyButton: React.FC<ApyButtonProps> = ({
  variant,
  pid,
  isOld,
  lpLabel,
  lpSymbol,
  cakePrice,
  harvestInterval,
  apr,
  multiplier,
  displayApr,
  addLiquidityUrl,
}) => {
  const { t } = useTranslation()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const { lpTokenBalance, stakedBalance } = useVaultUser(pid, isOld)
  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      linkLabel={t('Get %symbol%', { symbol: lpLabel })}
      stakingTokenBalance={stakedBalance.plus(lpTokenBalance)}
      stakingTokenSymbol={lpSymbol}
      stakingTokenPrice={lpPrice.toNumber()}
      earningTokenPrice={cakePrice.toNumber()}
      apr={apr}
      multiplier={multiplier}
      displayApr={displayApr}
      linkHref={addLiquidityUrl}
      isFarm
    />,
  )

  const handleClickButton = (event): void => {
    event.stopPropagation()
    onPresentApyModal()
  }

  return (
    <ApyLabelContainer alignItems="center" onClick={handleClickButton}>
      {(getApy(apr, 86400 / harvestInterval.toNumber(), 365) * 100).toLocaleString('en-US', {maximumFractionDigits: 2})}%
      {variant === 'text-and-button' && (
        <IconButton variant="text" scale="sm" ml="4px">
          <CalculateIcon width="18px" />
        </IconButton>
      )}
    </ApyLabelContainer>
  )
}

ApyButton.defaultProps = {
  isOld: false
}

export default ApyButton
