import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Flex, InjectedModalProps, ModalHeader, ModalTitle, ModalCloseButton, ModalContainer, ModalBody, Text, Heading } from '@pancakeswap/uikit'
import { ModalActions } from 'components/Modal'
import Dots from 'components/Loader/Dots';
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state';
import { DeserializedNFTGego } from 'state/types'
import { fetchNFTUserBalanceDataAsync } from 'state/nft';
import useToast from 'hooks/useToast';
import useUnstakeNFT from '../hooks/useUnstakeNFT';



const StyledModalContainer = styled(ModalContainer)`
  max-width: 420px;
  width: 100%;
`


const StyledModalBody = styled(ModalBody)`
  padding: 24px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

interface ExitNFTModalProps {
  gegos?: DeserializedNFTGego[]
  account: string
  isV2?: boolean
}

const ExitNFTModal: React.FC<InjectedModalProps & ExitNFTModalProps> = ({ account, gegos, isV2 = true, onDismiss }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const { onExitNFT } = useUnstakeNFT()
  const handleExitNFT = useCallback(async() => {

    try {
      setPendingTx(true)
      await onExitNFT(gegos[0].address, isV2)
      dispatch(fetchNFTUserBalanceDataAsync({account}))
      toastSuccess(t('Success'), t('Your NFTs has been unstaked'))
      onDismiss()
    } catch (e) {
      if (typeof e === 'object' && 'message' in e) {
        const err: any = e;
        toastError(t('Error'), err.message)
      } else {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
      console.error(e)
    } finally {
      setPendingTx(false)
    }
  }, [onExitNFT, onDismiss, toastError, toastSuccess, t, dispatch, account, isV2, gegos])

  return (
    <StyledModalContainer minWidth="320px">
      <ModalHeader>
        <ModalTitle>
          <Heading>{t('Unstake all and Harvest')}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      <StyledModalBody>
        <Text>
          {t('Do you want to withdraw all NFTs staked and harvest from this pool?')}
        </Text>
        <ModalActions>
          <Button scale="md" variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          <Button
            scale="md" variant="primary" width="100%"
            onClick={handleExitNFT}
            disabled={pendingTx || gegos?.length === 0}
          >
            {pendingTx ? (
              <Dots>{t('Processing')}</Dots>
            ) : t('Confirm')}
          </Button>
        </ModalActions>
      </StyledModalBody>
    </StyledModalContainer>
  )
}

export default ExitNFTModal
