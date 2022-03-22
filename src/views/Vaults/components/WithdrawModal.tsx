import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Flex, Modal, Radio, Slider, Text } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import styled from 'styled-components'
import { ModalActions, ModalInput } from 'components/Modal'
import { TokenImage, TokenPairImage } from 'components/TokenImage'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { BIG_ONE, BIG_ZERO } from 'utils/bigNumber'
import useToast from 'hooks/useToast'
import PercentageButton from 'views/Pools/components/PoolCard/Modals/PercentageButton'
import tokens from 'config/constants/tokens'
import Dots from 'components/Loader/Dots'


const OptionGroup = styled(Flex)<{selected?: boolean}>`
  cursor: pointer;
  margin: 4px 0px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  border-color: ${({ selected, theme }) => (selected ? theme.colors.primary  : 'rgba(0,0,0,0.1)')};
  background: ${({ theme }) => theme.colors.background};
`

export enum WithdrawType {
  LP,
  TOKEN,
  BOTH_TOKEN
}

interface WithdrawModalProps {
  spyAmountInLP: BigNumber
  lpTotalSupply?: BigNumber
  maxLP: BigNumber
  maxToken: BigNumber
  token?: Token
  lpSymbol: string,
  onConfirm: (withdrawType: WithdrawType, amountInLP: string, amountToken: string) => void
  onDismiss?: () => void
  tokenName?: string
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onConfirm, onDismiss, token, maxLP, maxToken, spyAmountInLP, lpTotalSupply, lpSymbol }) => {

  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  const [percent, setPercent] = useState(0)
  const [withdrawType, setWithdrawType] = useState(WithdrawType.TOKEN)
  const [pendingTx, setPendingTx] = useState(false)
  const [amountLPToWithdraw, setAmountLPToWithdraw] = useState(BIG_ZERO)
  const [amountTokenToWithdraw, setAmountTokenToWithdraw] = useState(BIG_ZERO)

  const tokenSymbol = token.symbol === 'WBNB' ? 'BNB' : token.symbol

  const lpAmount= useMemo(() => {
    const lpAmountNumber = getBalanceAmount(amountLPToWithdraw)
    if (lpAmountNumber.gt(0) && lpAmountNumber.lt(0.0000001)) {
      return '<0.0000001'
    }
    if (lpAmountNumber.gt(0)) {
      return lpAmountNumber.toFixed(8, BigNumber.ROUND_DOWN)
    }
    return lpAmountNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [amountLPToWithdraw])

  const spyAmount = useMemo(() => {
    return lpTotalSupply ? getFullDisplayBalance(amountLPToWithdraw.div(lpTotalSupply).multipliedBy(spyAmountInLP), 0, 2) : '0'
  }, [amountLPToWithdraw, lpTotalSupply, spyAmountInLP])

  const tokenAmount = useMemo(() => {
    return getFullDisplayBalance(amountTokenToWithdraw.dividedBy(2), token.decimals, 2)
  }, [amountTokenToWithdraw, token])

  const tokenFullAmount = useMemo(() => {
    return getFullDisplayBalance(amountTokenToWithdraw, token.decimals, 2)
  }, [amountTokenToWithdraw, token])

  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      setAmountLPToWithdraw(maxLP.dividedBy(100).multipliedBy(sliderPercent))
      setAmountTokenToWithdraw(maxToken.dividedBy(100).multipliedBy(sliderPercent))
    } else {
      setAmountLPToWithdraw(BIG_ZERO)
      setAmountTokenToWithdraw(BIG_ZERO)
    }
    setPercent(sliderPercent)
  }

  return (
    <Modal title={t('Unstake')} onDismiss={onDismiss}>
      <Flex flexDirection="column" width="320px" maxWidth="100%">
        <Text textAlign="center" mb="12px">
          {t('Choose option to Unstake your Token')}
        </Text>
        <OptionGroup 
          selected={withdrawType === WithdrawType.TOKEN}
          onClick={() => setWithdrawType(WithdrawType.TOKEN)}>
          <Flex width="60px">
            <TokenImage token={token} width={48} height={48}/>
          </Flex>
          <Flex flexDirection="column" justifyContent="center">
            <Text>{t('Unstake to %symbol%', {symbol: tokenSymbol})}</Text>
            <Text>{tokenFullAmount} {tokenSymbol}</Text>
          </Flex>
        </OptionGroup>
        <OptionGroup
          selected={withdrawType === WithdrawType.BOTH_TOKEN}
          onClick={() => setWithdrawType(WithdrawType.BOTH_TOKEN)}>
          <Flex width="60px" alignItems="center">
            <TokenImage token={tokens.spy} width={24} height={24}/>
            <TokenImage token={token} width={24} height={24}/>
          </Flex>
          <Flex flexDirection="column" justifyContent="center">
            <Text>{t('Unstake to %symbol1% and %symbol2%', {symbol1: 'SPY', symbol2: tokenSymbol})}</Text>
            <Text>{spyAmount} SPY + {tokenAmount} {tokenSymbol}</Text>
          </Flex>
        </OptionGroup>
        <OptionGroup
          selected={withdrawType === WithdrawType.LP}
          onClick={() => setWithdrawType(WithdrawType.LP)}>
          <Flex width="60px">
            <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={tokens.spy} width={48} height={48}/>
          </Flex>
          <Flex flexDirection="column" justifyContent="center">
            <Text>{t('Unstake to %symbol%', {symbol: lpSymbol})}</Text>
            <Text>{lpAmount} {lpSymbol}</Text>
          </Flex>
        </OptionGroup>
      </Flex>
      <Slider
        min={0}
        max={100}
        value={percent}
        onValueChanged={handleChangePercent}
        name="unstake"
        valueLabel={`${percent}%`}
        step={1}
      />
      <Flex alignItems="center" justifyContent="space-between" mt="8px">
        <PercentageButton onClick={() => handleChangePercent(25)}>25%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(50)}>50%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(75)}>75%</PercentageButton>
        <PercentageButton onClick={() => handleChangePercent(100)}>{t('Max')}</PercentageButton>
      </Flex>
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        <Button
          disabled={pendingTx || !amountLPToWithdraw.isFinite() || amountLPToWithdraw.eq(0) || amountLPToWithdraw.gt(maxLP)}
          onClick={async () => {
            setPendingTx(true)
            try {
              await onConfirm(withdrawType, amountLPToWithdraw.toString(), amountTokenToWithdraw.toString())
              toastSuccess(t('Unstaked!'), t('Your earnings have also been harvested to your wallet'))
              onDismiss()
            } catch (e) {
              const error = e as any
              const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
              toastError(
                t('Error'),
                msg,
              )
            } finally {
              setPendingTx(false)
            }
          }}
          width="100%"
        >
          {pendingTx ? (<Dots>{t('Confirming')}</Dots>) : t('Confirm')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default WithdrawModal
