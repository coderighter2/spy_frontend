import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Modal, Heading, Flex, Text, InjectedModalProps, ModalHeader, ModalTitle, ModalCloseButton, ModalContainer, ModalBody, ModalBackButton } from '@pancakeswap/uikit'
import { nftGrades } from 'config/constants/nft';
import tokens from 'config/constants/tokens';
import { NFTGradeConfig } from 'config/constants/nft/types';
import { ModalActions } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state';
import { DeserializedNFTGego } from 'state/types'
import { fetchNFTAllowancesAsync, fetchNFTUserBalanceDataAsync } from 'state/nft';
import { useNFTRewardAllowance, useOldNFTRewardAllowance } from 'state/nft/hooks';
import { BIG_TEN } from 'utils/bigNumber';
import { useSpyNFT } from 'hooks/useContract';
import useToast from 'hooks/useToast';
import Dots from 'components/Loader/Dots';
import useApproveGeneralReward from '../hooks/useApproveGeneralReward';
import useStakeNFT from '../hooks/useStakeNFT';
import NFTGradeRow from './NFTGradeRow';
import NFTSelector from './NFTSelector';

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

const Scrollable = styled(Flex)`
  max-height: 400px;
  overflow-y: scroll;
`

interface StakeNFTsModalProps {
  gego?: DeserializedNFTGego
  gegos?: DeserializedNFTGego[]
  account: string
  isV2?: boolean
}

const StakeNFTsModal: React.FC<InjectedModalProps & StakeNFTsModalProps> = ({ account, gego, gegos, isV2 = true, onDismiss }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { toastError, toastSuccess } = useToast()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const [modalView, setModalView] = useState<StakeModalView>(StakeModalView.main)
  const [pendingTx, setPendingTx] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [selectedGegos, setSelectedGegos] = useState({})
  const nftContract = useSpyNFT(tokens.spynft.address)
  const { onApproveGeneralReward: onApprove } = useApproveGeneralReward(nftContract)
  const { onStakeNFTMulti } = useStakeNFT()
  const oldAllowance = useOldNFTRewardAllowance()
  const allowance = useNFTRewardAllowance()
  const isApproved = account && ((isV2 && allowance) || (!isV2 && oldAllowance));

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)

      const selection = {}

      if (gego) {
        selection[gego.id] = true
      } else if (gegos.length > 0) {
        selection[gegos[0].id] = true
      }
      setSelectedGegos(selection)
    }
  }, [gego, gegos, loaded])

  const handleSelect = (item) => {
    const selectedGegos_ = {...selectedGegos}
    selectedGegos_[item.id] = !selectedGegos_[item.id]
    setSelectedGegos(selectedGegos_)
    console.log(selectedGegos_)
  }

  const countSelected = useMemo(() => {
    return gegos.filter((item) => !!selectedGegos[item.id]).length
  }, [selectedGegos, gegos])

  const selectedGegoIds = useMemo(() => {
    return gegos.filter((item) => !!selectedGegos[item.id]).map((item) => item.id)
  }, [selectedGegos, gegos])

  const handleToggleSelectAll = useCallback(async () => {
    if (countSelected === gegos.length) {
      // deselect all

      setSelectedGegos({})
    } else {
      const selectedGegos_ = {}
      gegos.forEach((item) => {
        selectedGegos_[item.id] = true
      })
      setSelectedGegos(selectedGegos_)
    }
  }, [gegos, countSelected])

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
      const gegoIds = selectedGegoIds
      await onStakeNFTMulti(gegoIds, isV2)
      dispatch(fetchNFTUserBalanceDataAsync({account}))
      toastSuccess(t('Success'), t('Your NFT(s) have been staked'))
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
  }, [onStakeNFTMulti, onDismiss, toastError, toastSuccess, t, dispatch, account, selectedGegoIds, isV2])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <Button
        scale="md" variant="primary" width="100%"
        onClick={handleStakeNFT}
        disabled={pendingTx || countSelected === 0}
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
          <Heading>{ modalView === StakeModalView.main ? 'Stake your NFT cards' : 'Choose a NFT card'}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      <StyledModalBody>
        <Flex justifyContent="space-between" alignItems="center">
          <Text>{countSelected} {t('NFT(s) selected')}</Text>
          <Button scale="sm" onClick={handleToggleSelectAll}>
            {countSelected === gegos.length ? t('Deselect All') : t('Select All')}
          </Button>
        </Flex>
        <Scrollable>
        <Flex flexDirection="column">
          { gegos.map((g) => (
              <NFTGradeRow gego={g} key={g.id} selectable selected={!!selectedGegos[g.id]} onSelect={() => handleSelect(g)} spyDecimals={tokens.spy.decimals}/>
            )
          )}
        </Flex>
        </Scrollable>
        <ModalActions>
          <Button scale="md" variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          {renderApprovalOrStakeButton()}
        </ModalActions>
      </StyledModalBody>
    </StyledModalContainer>
  )
}

export default StakeNFTsModal
