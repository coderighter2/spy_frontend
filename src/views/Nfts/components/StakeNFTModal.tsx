import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Modal, Heading, Flex, Text, InjectedModalProps, ModalHeader, ModalTitle, ModalCloseButton, ModalContainer, ModalBody, ModalBackButton } from '@pancakeswap/uikit'
import { nftGrades } from 'config/constants/nft';
import tokens from 'config/constants/tokens';
import { NFTGradeConfig } from 'config/constants/nft/types';
import { ModalActions } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state';
import { DeserializedNFTGego } from 'state/types'
import { fetchNFTAllowancesAsync, fetchNFTUserBalanceDataAsync, fetchNFTSignatureUserBalanceDataAsync } from 'state/nft';
import { useNFTRewardAllowance, useOldNFTRewardAllowance, useNFTSignatureRewardAllowance } from 'state/nft/hooks';
import { BIG_TEN } from 'utils/bigNumber';
import { useSpyNFT } from 'hooks/useContract';
import useToast from 'hooks/useToast';
import Dots from 'components/Loader/Dots';
import useApproveGeneralReward from '../hooks/useApproveGeneralReward';
import useStakeNFT from '../hooks/useStakeNFT';
import NFTGradeRow from './NFTGradeRow';
import NFTSelector from './NFTSelector';
import { isSpyNFT } from '../helpers';

enum StakeModalView {
  main,
  list,
}
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

interface StakeNFTModalProps {
  gego?: DeserializedNFTGego
  gegos?: DeserializedNFTGego[]
  account: string
  isV2?: boolean
}

const StakeNFTModal: React.FC<InjectedModalProps & StakeNFTModalProps> = ({ account, gego, gegos, isV2 = true, onDismiss }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { toastError, toastSuccess } = useToast()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const [modalView, setModalView] = useState<StakeModalView>(StakeModalView.main)
  const [pendingTx, setPendingTx] = useState(false)
  const [selectedGego, setSelectedGego] = useState(gego || (gegos && gegos.length > 0 ? gegos[0]: null))
  const nftAddress = gego ? gego.address : gegos ?  gegos[0].address : null
  const { onApproveGeneralReward: onApprove } = useApproveGeneralReward(nftAddress)
  const { onStakeNFT } = useStakeNFT()
  const oldAllowance = useOldNFTRewardAllowance()
  const allowance = useNFTRewardAllowance()
  const signatureAllowance = useNFTSignatureRewardAllowance()
  const isApproved = useMemo(() => {
    if (!account) {
      return false
    }
    if (isSpyNFT(nftAddress)) {
      return (isV2 && allowance) || (!isV2 && oldAllowance)
    }
    return signatureAllowance
  }, [account, isV2, allowance, oldAllowance, nftAddress, signatureAllowance])


  const handleApprove = useCallback(async() => {
    try {
        setRequestedApproval(true)
        await onApprove(isV2)
        dispatch(fetchNFTAllowancesAsync({account}))
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
      } finally {
        setRequestedApproval(false)
      }
  }, [onApprove, toastError, t, dispatch, account, isV2])

  const handleStakeNFT = useCallback(async() => {

    try {
      setPendingTx(true)
      await onStakeNFT(nftAddress, selectedGego.id, isV2)

      if (isSpyNFT(nftAddress)) {
        dispatch(fetchNFTUserBalanceDataAsync({account}))
      } else {
        dispatch(fetchNFTSignatureUserBalanceDataAsync({account}))
      }
      toastSuccess(t('Success'), t('Your NFT #%id% has been staked', {id: selectedGego.id}))
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
  }, [onStakeNFT, onDismiss, toastError, toastSuccess, t, dispatch, account, nftAddress, selectedGego, isV2])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <Button
        scale="md" variant="primary" width="100%"
        onClick={handleStakeNFT}
        disabled={pendingTx || !selectedGego}
      >
        {pendingTx ? (
          <Dots>{t('Processing')}</Dots>
        ) : t('Confirm')}
      </Button>
    ) : (
      <Button scale="md" variant="primary" width="100%" disabled={requestedApproval} onClick={handleApprove}>
        {t('Approve')}
      </Button>
    )
  }

  return (
    <StyledModalContainer minWidth="320px">
      <ModalHeader>
        <ModalTitle>
          { modalView === StakeModalView.list && (
            <ModalBackButton onBack={() => setModalView(StakeModalView.main)} />
          )}
          <Heading>{ modalView === StakeModalView.main ? 'Stake your NFT card' : 'Choose a NFT card'}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      { modalView === StakeModalView.main ? (
      <StyledModalBody>
        <NFTGradeRow gego={selectedGego} spyDecimals={tokens.spy.decimals} onSelect={() => setModalView(StakeModalView.list)} selectable={gegos && gegos.length > 0} />
        <ModalActions>
          <Button scale="md" variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          {renderApprovalOrStakeButton()}
        </ModalActions>
      </StyledModalBody>
      ) : (
      <StyledModalBody>
        <NFTSelector gegos={gegos} onSelect={(g) => {
          setSelectedGego(g)
          setModalView(StakeModalView.main)
        }} />
      </StyledModalBody>
      )}
    </StyledModalContainer>
  )
}

export default StakeNFTModal
