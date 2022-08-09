import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Modal, Text } from '@pancakeswap/uikit'
import { ModalActions } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import useToast from 'hooks/useToast'

interface CastConfirmModalProps {
  onConfirm: () => void
  onDismiss?: () => void
}

const CastConfirmModal: React.FC<CastConfirmModalProps> = ({ onConfirm, onDismiss}) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()

  return (
    <Modal title={t('Buy NFT Signature')} onDismiss={onDismiss}>
      <Text>{t('You will get a random NFT signature with random mining power between 200% ~ 400%')}</Text>
      
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%">
          {t('Cancel')}
        </Button>
        <Button
          onClick={async () => {
            onConfirm()
            onDismiss()
          }}
          width="100%"
        >
          {t('Confirm')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default CastConfirmModal
