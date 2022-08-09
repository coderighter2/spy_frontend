import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button, Modal, Heading, Flex, Text, InjectedModalProps } from '@pancakeswap/uikit'
import { nftGrades } from 'config/constants/nft';
import tokens from 'config/constants/tokens';
import { ModalActions } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { DeserializedNFTGego } from 'state/types'
import { BIG_TEN } from 'utils/bigNumber';


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
  amount: number|string
  customOnDismiss?: () => void
}

const CastedModal: React.FC<InjectedModalProps & CastedModalProps> = ({ amount, customOnDismiss, onDismiss }) => {
  const { t } = useTranslation()
  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }
    onDismiss()
  }, [customOnDismiss, onDismiss])

  return (
    <Modal title={t('NFT Signatures Purchased')} onDismiss={handleDismiss}>

      <ModalInnerContainer>
      <Text>{t('You purchased %amount% NFT Signatures', {amount})}</Text>
      <ModalActions>
        <Button variant="primary" onClick={handleDismiss} width="100%">
          {t('OK')}
        </Button>
      </ModalActions>
      </ModalInnerContainer>
    </Modal>
  )
}

export default CastedModal
