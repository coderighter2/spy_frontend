import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Modal, LinkExternal } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from 'components/Modal'
import Dots from 'components/Loader/Dots'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useVaultUser } from 'state/vaults/hooks'
import useToast from 'hooks/useToast'


interface DepositLPModalProps {
  pid?: number
  max?: BigNumber
  addTokenUrl?: string
  lpLabel?: string
  onRequestApproveLP: () => void
  onConfirm: (amount: string) => void
  onDismiss?: () => void
}

const DepositLPModal: React.FC<DepositLPModalProps> = ({
  pid,
  addTokenUrl,
  lpLabel,
  onRequestApproveLP,
  onConfirm,
  onDismiss
}) => {
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { t } = useTranslation()
  const {lpAllowance, lpTokenBalance} = useVaultUser(pid)
  const fullBalance = useMemo(() => {
    return lpTokenBalance ? getFullDisplayBalance(lpTokenBalance) : ''
  }, [lpTokenBalance])

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

  const handleRequestApproval = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onRequestApproveLP()
      setRequestedApproval(false)
    } catch (e) {
      setRequestedApproval(false)
    }
  }, [onRequestApproveLP])

  const renderApprovalOrStakeButton = () => {
    return lpAllowance && lpAllowance.isFinite() && lpAllowance.gt(0) ? (
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
          } finally {
            setPendingTx(false)
          }
        }}
      >
        {pendingTx ? (<Dots>{t('Confirming')}</Dots>)  : t('Confirm')}
      </Button>
    ) : (
      <Button mt="8px" width="100%" disabled={requestedApproval} onClick={handleRequestApproval}>
        {
        requestedApproval ? (<Dots>{t('Approving')}</Dots>) 
        : t('Approve %symbol%', {symbol: lpLabel})}
      </Button>
    )
  }


  return (
    <Modal title={t('Stake %symbol%', {symbol: lpLabel})} onDismiss={onDismiss}>
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={lpLabel}
        addLiquidityUrl={addTokenUrl}
        inputTitle={t('Stake')}
      />
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        {renderApprovalOrStakeButton()}
      </ModalActions>
      <LinkExternal href={addTokenUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: lpLabel })}
      </LinkExternal>
    </Modal>
  )
}

export default DepositLPModal
