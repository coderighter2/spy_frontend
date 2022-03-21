import React, { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Token } from '@pancakeswap/sdk'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, IconButton, AddIcon, MinusIcon, useModal } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { useAppDispatch } from 'state'
import { fetchVaultsPublicDataAsync, fetchVaultUserDataAsync } from 'state/vaults'
import { useLpTokenPrice } from 'state/farms/hooks'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import DepositModal from '../DepositModal'
import WithdrawModal, { WithdrawType } from '../WithdrawModal'
import useUnstakeVault from '../../hooks/useUnstakeVault'
import useStakeVault from '../../hooks/useStakeVault'

interface VaultCardActionsProps {
  spyAmountInLP: BigNumber
  tokenAmountInLP: BigNumber
  lpTotalSupply?: BigNumber
  stakedLPBalance?: BigNumber
  tokenBalance?: BigNumber
  tokenBalanceInVault?: BigNumber
  tokenName?: string
  lpTokenName?: string
  lpAddress?:string
  token?: Token
  pid?: number
  contractAddress: string
  isETH: boolean
  addTokenUrl?: string
  disabled?: boolean
}

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
  }
`

const StakeAction: React.FC<VaultCardActionsProps> = ({
  spyAmountInLP,
  tokenAmountInLP,
  lpTotalSupply,
  stakedLPBalance,
  tokenBalance,
  tokenBalanceInVault,
  tokenName,
  lpTokenName,
  lpAddress,
  token,
  pid,
  addTokenUrl,
  contractAddress,
  isETH,
  disabled
}) => {
  const { t } = useTranslation()
  const { onStake } = useStakeVault(contractAddress, isETH)
  const { onUnstake, onUnstakeLP } = useUnstakeVault(contractAddress, isETH)
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const lpPrice = useLpTokenPrice(lpTokenName)
  const tokenPrice = useBUSDPrice(token)

  const handleStake = async (amount: string) => {
    const value = new BigNumber(amount).multipliedBy(BIG_TEN.pow(token.decimals))
    await onStake(value.toJSON())
    dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
    dispatch(fetchVaultsPublicDataAsync([pid]))
  }

  const handleUnstake = async (withdrawType: WithdrawType, amountInLP: string, amountInTken: string) => {
    if (withdrawType === WithdrawType.LP) {
      await onUnstakeLP(new BigNumber(amountInLP).decimalPlaces(0).toJSON())
    } else  {
      await onUnstake(new BigNumber(amountInTken).decimalPlaces(0).toJSON(), withdrawType === WithdrawType.TOKEN)
    }
    dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
    dispatch(fetchVaultsPublicDataAsync([pid]))
  }

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(tokenBalanceInVault, token.decimals)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return '<0.0000001'
    }
    if (stakedBalanceBigNumber.gt(0)) {
      return stakedBalanceBigNumber.toFixed(8, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [tokenBalanceInVault, token])

  const displayBUSDBalance = useCallback(() => {
    let stakedBalanceBigNumber = getBalanceAmount(tokenBalanceInVault, token.decimals)
    stakedBalanceBigNumber = tokenPrice ? stakedBalanceBigNumber.multipliedBy(new BigNumber(tokenPrice.toFixed())) : BIG_ZERO
    return stakedBalanceBigNumber.toNumber()
  }, [tokenBalanceInVault, token, tokenPrice])

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      onConfirm={handleStake}
      tokenName={tokenName}
      addTokenUrl={addTokenUrl}
    />,
  )

  const [onPresentWithdraw] = useModal(
    <WithdrawModal 
      maxLP={stakedLPBalance} 
      maxToken={tokenBalanceInVault}
      onConfirm={handleUnstake} 
      lpSymbol={lpTokenName} 
      spyAmountInLP={spyAmountInLP}
      lpTotalSupply={lpTotalSupply}
      token={token}/>,
  )

  const renderStakingButtons = () => {
    return stakedLPBalance.eq(0) ? (
      <Button
        disabled={disabled}
        onClick={onPresentDeposit}
      >
        {t('Stake')}
      </Button>
    ) : (
      <IconButtonWrapper>
        <IconButton variant="tertiary" 
        disabled={disabled} onClick={onPresentWithdraw} mr="6px">
          <MinusIcon color="primary" width="14px" />
        </IconButton>
        <IconButton
          variant="tertiary"
          disabled={disabled}
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
            value={displayBUSDBalance()}
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
