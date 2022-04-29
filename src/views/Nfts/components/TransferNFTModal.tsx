import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Flex, InjectedModalProps, ModalHeader, ModalTitle, ModalCloseButton, ModalContainer, ModalBody, Text, Heading } from '@pancakeswap/uikit'
import { ModalActions } from 'components/Modal'
import Dots from 'components/Loader/Dots';
import { StyledAddressInput } from 'components/StyledControls';
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state';
import { DeserializedNFTGego } from 'state/types'
import { fetchNFTUserBalanceDataAsync } from 'state/nft';
import useToast from 'hooks/useToast';
import tokens from 'config/constants/tokens';
import { isAddress } from 'utils';
import useUnstakeNFT from '../hooks/useUnstakeNFT';
import useTransferNFT from '../hooks/useTransferNFT';
import NFTGradeRow from './NFTGradeRow';



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

interface TransferNFTModalProps {
  gego: DeserializedNFTGego
  account: string
}

const TransferNFTModal: React.FC<InjectedModalProps & TransferNFTModalProps> = ({ account, gego, onDismiss }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const validToAddress = isAddress(toAddress)
  const { onTransferNFT } = useTransferNFT()
  const handleTransfer = useCallback(async() => {

    if (!validToAddress) {
      return
    }

    try {
      setPendingTx(true)
      await onTransferNFT(gego.id, account, validToAddress)
      dispatch(fetchNFTUserBalanceDataAsync({account}))
      toastSuccess(t('Success'), t('Your NFTs has been transferred'))
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
  }, [onTransferNFT, onDismiss, toastError, toastSuccess, t, dispatch, account, validToAddress, gego])

  return (
    <StyledModalContainer minWidth="320px">
      <ModalHeader>
        <ModalTitle>
          <Heading>{t('Transfer')}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      <StyledModalBody>
        <Text>
          {t('Do you want to transfer this NFT?')}
        </Text>
        <NFTGradeRow gego={gego} spyDecimals={tokens.spy.decimals}/>
        <Text fontSize="14px" mt="16px">{t('Send To:')}</Text>
        <StyledAddressInput 
            placeholder={t('e.g. 0x...')} 
            value={toAddress}
            onUserInput={(val) => setToAddress(val)}
        />
        <ModalActions>
          <Button scale="md" variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          <Button
            scale="md" variant="primary" width="100%"
            onClick={handleTransfer}
            disabled={pendingTx || !validToAddress}
          >
            {pendingTx ? (
              <Dots>{t('Processing')}</Dots>
            ) : t('Transfer')}
          </Button>
        </ModalActions>
      </StyledModalBody>
    </StyledModalContainer>
  )
}

export default TransferNFTModal
