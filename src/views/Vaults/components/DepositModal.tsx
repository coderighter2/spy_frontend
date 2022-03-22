import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Button, Modal, LinkExternal, IconButton, ModalHeader, ModalTitle, Heading, CloseIcon, ModalContainer, ModalBody, WarningIcon, Checkbox } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import Dots from 'components/Loader/Dots'

const StyledCheckbox = styled(Checkbox)`
  background: transparent;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 4px;
  ::after {
  }
  &:checked {
    border: 1px solid ${({ theme }) => theme.colors.text};
    background: transparent;
    ::after {
      border-color: ${({ theme }) => theme.colors.text};
    }
  }
  &:focus:not(:disabled), &:hover:not(:disabled):not(:checked) {
      box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
  }
`

interface DepositModalProps {
  max: BigNumber
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
  addTokenUrl?: string
}

const DepositModal: React.FC<DepositModalProps> = ({
  max,
  onConfirm,
  onDismiss,
  tokenName = '',
  addTokenUrl,
}) => {
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const tokensToStake = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  if (!agreed) {
    return (
      <ModalContainer minWidth="300px">
        <ModalHeader>
          <ModalTitle  mt="8px">
            <WarningIcon width="32px" height="32px" mr="12px" color="warning"/>
            <Heading color="warning">{t('Risk Warning')}</Heading>
          </ModalTitle>
          <IconButton variant="text" color="primary" onClick={onDismiss}>
            <CloseIcon width="20px" color="text" />
          </IconButton>
        </ModalHeader>
        <ModalBody p="24px 24px 12px" maxWidth="400px" width="100%">
          <Flex flexDirection="column" >
            <Text textAlign="justify">
              {t('Staking %symbol% into this pool, you will be a liquidity provider, and this is not risk-fee. When the market price of tokens fluctuates greatly, the staking amount may be lower than the staked amount, which is called Impermanent Loss.', {symbol: tokenName})}
            </Text>
            <Text textAlign="justify" mt="12px">
              {t('This pool is still in beta. Please use at your own risk.')}
            </Text>
            <Flex mt="12px">
              <StyledCheckbox onChange={() => setChecked(!checked)} checked={checked}/>
              <Flex flex="1">
                <Text>
                  {t('I confirm that I have read, understand, and agree all the risks.')}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <ModalActions>
            <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
              {t('Cancel')}
            </Button>
            <Button width="100%" disabled={!checked} onClick={() => setAgreed(true)}>
              {t('Confirm')}
            </Button>
          </ModalActions>
        </ModalBody>

      </ModalContainer>
    )
  }

  return (
    <Modal title={t('Stake %symbol%', {symbol: tokenName})} onDismiss={onDismiss}>
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
        addLiquidityUrl={addTokenUrl}
        inputTitle={t('Stake')}
      />
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        <Button
          width="100%"
          disabled={
            pendingTx || !tokensToStake.isFinite() || tokensToStake.eq(0) || tokensToStake.gt(fullBalanceNumber)
          }
          onClick={async () => {
            setPendingTx(true)
            try {
              await onConfirm(val)
              toastSuccess(t('Staked!'), t('Your funds have been staked in the vault'))
              onDismiss()
            } catch (e) {
              const error = e as any
              const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
              toastError(
                t('Error'),
                msg,
              )
              console.error(e)
            } finally {
              setPendingTx(false)
            }
          }}
        >
          {pendingTx ? (<Dots>{t('Confirming')}</Dots>) : t('Confirm')}
        </Button>
      </ModalActions>
      <LinkExternal href={addTokenUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: tokenName })}
      </LinkExternal>
    </Modal>
  )
}

export default DepositModal
