import React, { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@pancakeswap/sdk'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, IconButton, AddIcon, MinusIcon, useModal } from '@pancakeswap/uikit'
import { useLocation } from 'react-router-dom'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state'
import { fetchVaultUserDataAsync } from 'state/vaults'
import { useLpTokenPrice } from 'state/farms/hooks'
import { BIG_TEN } from 'utils/bigNumber'
import { getBalanceAmount, getBalanceNumber } from 'utils/formatBalance'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import useUnstakeVault from '../../hooks/useUnstakeVault'
import useStakeVault from '../../hooks/useStakeVault'

interface VaultCardActionsProps {
  stakedLPBalance?: BigNumber
  tokenBalance?: BigNumber
  tokenName?: string
  lpTokenName?: string
  token?: Token
  pid?: number
  contractAddress: string
  isETH: boolean
  multiplier?: string
  apr?: number
  displayApr?: string
  addTokenUrl?: string
  cakePrice?: BigNumber
  lpLabel?: string
}

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
  }
`

const StakeAction: React.FC<VaultCardActionsProps> = ({
  stakedLPBalance,
  tokenBalance,
  tokenName,
  lpTokenName,
  token,
  pid,
  multiplier,
  apr,
  displayApr,
  addTokenUrl,
  cakePrice,
  lpLabel,
  contractAddress,
  isETH
}) => {
  const { t } = useTranslation()
  const { onStake } = useStakeVault(contractAddress, isETH)
  const { onUnstake } = useUnstakeVault(contractAddress, isETH)
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const lpPrice = useLpTokenPrice(lpTokenName)

  const handleStake = async (amount: string) => {
    console.log('staking', amount)
    const value = new BigNumber(amount).multipliedBy(BIG_TEN.pow(token.decimals))
    await onStake(value.toJSON())
    dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
  }

  const handleUnstake = async (amount: string) => {
    const value = new BigNumber(amount).multipliedBy(BIG_TEN.pow(token.decimals))
    await onUnstake(value.toJSON(), true)
    dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
  }

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedLPBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return '<0.0000001'
    }
    if (stakedBalanceBigNumber.gt(0)) {
      return stakedBalanceBigNumber.toFixed(8, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedLPBalance])

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      stakedLPBalance={stakedLPBalance}
      onConfirm={handleStake}
      tokenName={tokenName}
      multiplier={multiplier}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      addTokenUrl={addTokenUrl}
      cakePrice={cakePrice}
    />,
  )
  const [onPresentWithdraw] = useModal(
    <WithdrawModal max={stakedLPBalance} onConfirm={handleUnstake} tokenName={tokenName} />,
  )

  const renderStakingButtons = () => {
    return stakedLPBalance.eq(0) ? (
      <Button
        onClick={onPresentDeposit}
      >
        {t('Stake')}
      </Button>
    ) : (
      <IconButtonWrapper>
        <IconButton variant="tertiary" onClick={onPresentWithdraw} mr="6px">
          <MinusIcon color="primary" width="14px" />
        </IconButton>
        <IconButton
          variant="tertiary"
          onClick={onPresentDeposit}
        >
          <AddIcon color="primary" width="14px" />
        </IconButton>
      </IconButtonWrapper>
    )
  }

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading color={stakedLPBalance.eq(0) ? 'textDisabled' : 'text'}>{displayBalance()}</Heading>
        {stakedLPBalance.gt(0) && lpPrice.gt(0) && (
          <Balance
            fontSize="12px"
            color="textSubtle"
            decimals={2}
            value={getBalanceNumber(lpPrice.times(stakedLPBalance))}
            unit=" USD"
            prefix="~"
          />
        )}
      </Flex>
      {renderStakingButtons()}
    </Flex>
  )
}

export default StakeAction
