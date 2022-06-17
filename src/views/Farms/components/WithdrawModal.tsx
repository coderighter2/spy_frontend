import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Modal, Text } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import { format } from 'date-fns'
import { useBlock } from 'state/block/hooks'

interface WithdrawModalProps {
  max: BigNumber
  lockUntil?: number
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onConfirm, onDismiss, lockUntil, max, tokenName = '' }) => {
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const { t } = useTranslation()
  const { currentBlock } = useBlock()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const valNumber = new BigNumber(val)
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

  const isLocked = useMemo(() => {
    const baseBlock = parseInt(process.env.REACT_APP_FARM_LOCK_BASE_BLOCK)
    const baseBlockTimestamp = parseInt(process.env.REACT_APP_FARM_LOCK_BASE_BLOCK_TIMESTAMP)
    const targetBlock = Math.floor((lockUntil - baseBlockTimestamp) / 3) + baseBlock
    return currentBlock < targetBlock
  }, [currentBlock, lockUntil])

  return (
    <Modal title={t('Unstake LP tokens')} onDismiss={onDismiss}>
      <ModalInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={fullBalance}
        symbol={tokenName}
        inputTitle={t('Unstake')}
      />
      {lockUntil ? (
      <Text color="secondary" fontSize="12px">{t('LP is locked till %date%', {date: format(lockUntil*1000, 'MMM dd yyyy')})}</Text>
      ) : (
        <Text color="secondary" fontSize="12px">{lockUntil}a</Text>
      )}
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        <Button
          disabled={pendingTx || !valNumber.isFinite() || valNumber.eq(0) || valNumber.gt(fullBalanceNumber) || isLocked}
          onClick={async () => {
            setPendingTx(true)
            try {
              await onConfirm(val)
              toastSuccess(t('Unstaked!'), t('Your earnings have also been harvested to your wallet'))
              onDismiss()
            } catch (e) {
              toastError(
                t('Error'),
                t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
              )
              console.error(e)
            } finally {
              setPendingTx(false)
            }
          }}
          width="100%"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default WithdrawModal
