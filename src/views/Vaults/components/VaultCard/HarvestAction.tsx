import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { useTranslation } from 'contexts/Localization'
import tokens from 'config/constants/tokens'
import { useAppDispatch } from 'state'
import { fetchVaultUserDataAsync } from 'state/vaults'
import useToast from 'hooks/useToast'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
import { usePriceCakeBusd } from 'state/farms/hooks'
import Balance from 'components/Balance'
import useHarvestVault from '../../hooks/useHarvestVault'

interface VaultCardActionsProps {
  token?: Token
  earnings?: BigNumber
  contractAddress: string
  isETH: boolean
  pid?: number
  nextHarvestUntil?: number
}

const HarvestAction: React.FC<VaultCardActionsProps> = ({ token, earnings, pid, contractAddress, isETH, nextHarvestUntil }) => {
  const { account } = useWeb3React()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const [pendingTx, setPendingTx] = useState(false)
  const { onReward } = useHarvestVault(contractAddress, isETH)
  const cakePrice = usePriceCakeBusd()
  const tokenPrice = useBUSDPrice(token)
  const dispatch = useAppDispatch()
  const rawEarningsBalanceInSpy = account ? getBalanceAmount(earnings, tokens.spy.decimals) : BIG_ZERO
  const earningsBusd = rawEarningsBalanceInSpy ? rawEarningsBalanceInSpy.multipliedBy(cakePrice).toNumber() : 0
  const displayBalance = rawEarningsBalanceInSpy && tokenPrice ? rawEarningsBalanceInSpy.multipliedBy(cakePrice).dividedBy(new BigNumber(tokenPrice.toFixed())).toFixed(3) : '0.000'

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading color={rawEarningsBalanceInSpy.eq(0) ? 'textDisabled' : 'text'}>{displayBalance}</Heading>
        {earningsBusd > 0 && (
          <Balance fontSize="12px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
        )}
      </Flex>
      <Button
        disabled={rawEarningsBalanceInSpy.eq(0) || pendingTx  }
        onClick={async () => {
          setPendingTx(true)
          try {
            await onReward(true)
            toastSuccess(
              `${t('Harvested')}!`,
              t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'SPY' }),
            )
          } catch (e) {
            toastError(
              t('Error'),
              t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
            )
            console.error(e)
          } finally {
            setPendingTx(false)
          }
          dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
        }}
      >
        {pendingTx ? t('Harvesting') : t('Harvest')}
      </Button>
    </Flex>
  )
}

export default HarvestAction
