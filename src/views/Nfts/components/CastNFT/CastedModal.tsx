import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Modal, Heading, Flex, Text, InjectedModalProps } from '@pancakeswap/uikit'
import { nftGrades } from 'config/constants/nft';
import tokens from 'config/constants/tokens';
import { ModalActions } from 'components/Modal'
import Dots from 'components/Loader/Dots';
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { DeserializedNFTGego } from 'state/types'
import { BIG_TEN } from 'utils/bigNumber';
import { useAppDispatch } from 'state';
import { fetchNFTAllowancesAsync, fetchNFTUserBalanceDataAsync } from 'state/nft';
import { useNFTRewardAllowance, useOldNFTRewardAllowance } from 'state/nft/hooks';
import { useSpyNFT } from 'hooks/useContract';
import useToast from 'hooks/useToast';
import useApproveGeneralReward from '../../hooks/useApproveGeneralReward';
import useStakeNFT from '../../hooks/useStakeNFT';


const ModalInnerContainer = styled(Flex)`
  flex-direction: column;
  padding: 0px 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0px 48px;
  }
`

const GradeImageWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  > img {
    width: 300px;
    max-width: calc(90vw - 120px);
  }

  ${({ theme }) => theme.mediaQueries.md} {
    > img {
      max-width: calc(100vw - 144px);
    }
  }
`

interface CastedModalProps {
  gego: DeserializedNFTGego
  account: string
  customOnDismiss?: () => void
}

const CastedModal: React.FC<InjectedModalProps & CastedModalProps> = ({ gego, account, customOnDismiss, onDismiss }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const gradeConfig = nftGrades(gego.address).find((c) => c.level === gego.grade)
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { onApproveGeneralReward: onApprove } = useApproveGeneralReward(tokens.spynft.address)
  const { onStakeNFTMulti } = useStakeNFT()
  const allowance = useNFTRewardAllowance()
  const isApproved = account && allowance;

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }
    onDismiss()
  }, [customOnDismiss, onDismiss])

  const handleApprove = useCallback(async() => {
    try {
        setRequestedApproval(true)
        await onApprove(true)
        dispatch(fetchNFTAllowancesAsync({account}))
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
      } finally {
        setRequestedApproval(false)
      }
  }, [onApprove, toastError, t, dispatch, account])

  const handleStakeNFT = useCallback(async() => {

    try {
      setPendingTx(true)
      await onStakeNFTMulti([gego.id], true)
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
  }, [onStakeNFTMulti, onDismiss, toastError, toastSuccess, t, dispatch, account, gego])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <Button
        scale="md" variant="primary" width="100%"
        onClick={handleStakeNFT}
        disabled={pendingTx}
      >
        {pendingTx ? (
          <Dots>{t('Processing')}</Dots>
        ) : t('Stake')}
      </Button>
    ) : (
      <Button scale="md" variant="primary" width="100%" disabled={requestedApproval} onClick={handleApprove}>
        {t('Approve For Staking')}
      </Button>
    )
  }

  return (
    <Modal title={t('Casted NFT(s) Completed')} onDismiss={handleDismiss}>

      <ModalInnerContainer>

        { gradeConfig && (
          <GradeImageWrapper>
            <img src={`/images/nft/${gradeConfig.image}`} alt={gradeConfig.grade}/>
          </GradeImageWrapper>
        )}

        <Heading textAlign="center" color="primary" mt="16px">
          {gradeConfig.grade.toString()}
        </Heading>
        <Flex justifyContent="center" mt="4px">
          <Text color="secondary" mr="8px">{t('Grade')}:</Text>
          <Text color="primary">{gego.grade}</Text>
        </Flex>
        {gego.lockedDays > 0 && (
        <Flex justifyContent="center">
          <Text color="secondary" mr="8px">{t('Locked days')}:</Text>
          <Text color="primary">{gego.lockedDays}</Text>
        </Flex>
        )}
        <Flex justifyContent="center">
          <Text color="secondary" mr="8px">{t('Mining Power')}:</Text>
          <Text color="primary">{gego.efficiency.multipliedBy(gego.amount).div(BIG_TEN.pow(tokens.spy.decimals)).div(100000).toFixed(2)} SPY</Text>
        </Flex>
        <Flex justifyContent="center">
          <Text color="secondary" mr="8px">{t('Mining Efficiency')}:</Text>
          <Text color="primary">{gego.efficiency.div(1000).toFixed(2)}</Text>
        </Flex>
      <ModalActions>
        {/* <Button variant="primary" onClick={handleDismiss} width="100%">
          {t('OK')}
        </Button> */}
        {renderApprovalOrStakeButton()}
      </ModalActions>
      </ModalInnerContainer>
    </Modal>
  )
}

export default CastedModal
