import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Box, Button, Flex, Heading, HelpIcon, useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync, fetchOldFarmUserDataAsync } from 'state/farms'
import useToast from 'hooks/useToast'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
import { usePriceCakeBusd } from 'state/farms/hooks'
import Balance from 'components/Balance'
import useHarvestFarm from '../../hooks/useHarvestFarm'

const ReferenceElement = styled.div`
  display: inline-block;
`
interface FarmCardActionsProps {
  earnings?: BigNumber
  pid?: number
  nextHarvestUntil?: number
  isOld?: boolean
}

const HarvestAction: React.FC<FarmCardActionsProps> = ({ isOld, earnings, pid, nextHarvestUntil }) => {
  const { account } = useWeb3React()
  const history = useHistory()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const [pendingTx, setPendingTx] = useState(false)
  const { onReward } = useHarvestFarm(pid, isOld)
  const cakePrice = usePriceCakeBusd()
  const dispatch = useAppDispatch()
  const rawEarningsBalance = account ? getBalanceAmount(earnings, 0) : BIG_ZERO
  const displayBalance = rawEarningsBalance.toFixed(3, BigNumber.ROUND_DOWN)
  const earningsBusd = rawEarningsBalance ? rawEarningsBalance.multipliedBy(cakePrice).toNumber() : 0
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Harvest / Stake is stopped working, please migrate your tokens to the main pools'),
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading color={rawEarningsBalance.eq(0) ? 'textDisabled' : 'text'}>{displayBalance}</Heading>
        {earningsBusd > 0 && (
          <Balance fontSize="12px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
        )}
      </Flex>
      <Button
        disabled={rawEarningsBalance.eq(0) || pendingTx || !nextHarvestUntil || nextHarvestUntil === 0  || nextHarvestUntil > Math.floor(Date.now() / 1000) }
        onClick={async () => {
          setPendingTx(true)
          try {
            const amount = await onReward()
            if (amount) {
              history.push(`/nfts?amount=${amount.toJSON()}`)
              toastSuccess(
                `${t('Harvested')}!`,
                t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'SPY' }),
              )
            } else {
              toastSuccess(
                `${t('Harvested')}!`,
                t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'SPY' }),
              )
            }
          } catch (e) {
            toastError(
              t('Error'),
              t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
            )
            console.error(e)
          } finally {
            setPendingTx(false)
          }
          if (isOld) {
            dispatch(fetchOldFarmUserDataAsync({ account, pids: [pid] }))
          } else {
            dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
          }
          history.push('/nfts')
        }}
      >
        <Flex justifyContent="center" alignItems="center">
          <span>{pendingTx ? t('Harvesting') : t('Harvest')}</span>
        </Flex>
      </Button>
      {tooltipVisible && tooltip}
    </Flex>
  )
}

HarvestAction.defaultProps = {
  isOld: false
}

export default HarvestAction
