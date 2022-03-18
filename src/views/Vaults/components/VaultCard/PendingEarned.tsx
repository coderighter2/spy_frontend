import React, { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, useModal } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import tokens from 'config/constants/tokens'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
import { usePriceCakeBusd } from 'state/farms/hooks'
import Balance from 'components/Balance'

interface PendingEarnedProps {
  token?: Token
  pendingEarnings?: BigNumber
}

const PendingEarned: React.FC<PendingEarnedProps> = ({ token, pendingEarnings}) => {
  const { account } = useWeb3React()
  const cakePrice = usePriceCakeBusd()
  const tokenPrice = useBUSDPrice(token)
  const rawPendingEarningsBalanceInSpy = account ? getBalanceAmount(pendingEarnings, tokens.spy.decimals) : BIG_ZERO
  const pendingEarningsInToken = rawPendingEarningsBalanceInSpy && tokenPrice ? rawPendingEarningsBalanceInSpy.multipliedBy(cakePrice).dividedBy(new BigNumber(tokenPrice.toFixed())).multipliedBy(BIG_TEN.pow(token.decimals)) : BIG_ZERO
  const pendingEarningsBusd = rawPendingEarningsBalanceInSpy ? rawPendingEarningsBalanceInSpy.multipliedBy(cakePrice).toNumber() : 0
  const displayPendingEarnings = getBalanceAmount(pendingEarningsInToken, token.decimals).toFixed(3)

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading color={rawPendingEarningsBalanceInSpy.eq(0) ? 'textDisabled' : 'text'}>{displayPendingEarnings}</Heading>
        {pendingEarningsBusd > 0 && (
          <Balance fontSize="12px" color="textSubtle" decimals={2} value={pendingEarningsBusd} unit=" USD" prefix="~" />
        )}
      </Flex>
    </Flex>
  )
}

export default PendingEarned
