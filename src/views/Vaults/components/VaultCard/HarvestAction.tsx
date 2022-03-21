import React, { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, useModal } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { useTranslation } from 'contexts/Localization'
import tokens from 'config/constants/tokens'
import { useAppDispatch } from 'state'
import { fetchVaultsPublicDataAsync, fetchVaultUserDataAsync } from 'state/vaults'
import useToast from 'hooks/useToast'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
import { usePriceCakeBusd } from 'state/farms/hooks'
import Balance from 'components/Balance'
import useHarvestVault from '../../hooks/useHarvestVault'
import HarvestModal from '../HarvestModal'

interface VaultCardActionsProps {
  token?: Token
  earnings?: BigNumber
  contractAddress: string
  isETH: boolean
  pid?: number
  disabled?: boolean
}

const HarvestAction: React.FC<VaultCardActionsProps> = ({ token, earnings, pid, contractAddress, isETH, disabled}) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { onReward } = useHarvestVault(contractAddress, isETH)
  const cakePrice = usePriceCakeBusd()
  const tokenPrice = useBUSDPrice(token)
  const dispatch = useAppDispatch()
  const rawEarningsBalanceInSpy = account ? getBalanceAmount(earnings, tokens.spy.decimals) : BIG_ZERO
  const earningsInToken = rawEarningsBalanceInSpy && tokenPrice ? rawEarningsBalanceInSpy.multipliedBy(cakePrice).dividedBy(new BigNumber(tokenPrice.toFixed())).multipliedBy(BIG_TEN.pow(token.decimals)) : BIG_ZERO
  const earningsBusd = rawEarningsBalanceInSpy ? rawEarningsBalanceInSpy.multipliedBy(cakePrice).toNumber() : 0
  const displayEarnings = getBalanceAmount(earningsInToken, token.decimals).toFixed(3)

  const handleHarvest = useCallback(async(receiveToken: boolean) => {
    await onReward(receiveToken)
    dispatch(fetchVaultUserDataAsync({account, pids: [pid]}))
    dispatch(fetchVaultsPublicDataAsync([pid]))
  }, [dispatch, onReward, account, pid])

  const [onPresentWithdraw] = useModal(
    <HarvestModal 
      spyAmount={earnings}
      tokenAmount={earningsInToken}
      token={token}
      onConfirm={handleHarvest} />,
  )

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading color={rawEarningsBalanceInSpy.eq(0) ? 'textDisabled' : 'text'}>{displayEarnings}</Heading>
        {earningsBusd > 0 && (
          <Balance fontSize="12px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
        )}
      </Flex>
      <Button
        disabled={disabled || !rawEarningsBalanceInSpy || rawEarningsBalanceInSpy.eq(0)}
        onClick={onPresentWithdraw}
      >
        {t('Harvest')}
      </Button>
    </Flex>
  )
}

export default HarvestAction
