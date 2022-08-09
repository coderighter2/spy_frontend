import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, InjectedModalProps, ModalHeader, ModalTitle, ModalCloseButton, ModalContainer, ModalBody, Text, Heading } from '@pancakeswap/uikit'
import { ModalActions } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { DeserializedNFTGego } from 'state/types'
import tokens from 'config/constants/tokens';
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber';
import NFTGradeRow from './NFTGradeRow';
import SPYInput from './SPYInput';



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

interface NFTSignatureInjectModalProps {
  gego: DeserializedNFTGego
  account: string
  onConfirm: (amount: string) => void
}

const NFTSignatureInjectModal: React.FC<InjectedModalProps & NFTSignatureInjectModalProps> = ({ account, gego, onConfirm, onDismiss }) => {
  const { t } = useTranslation()
  const [pendingTx, setPendingTx] = useState(false)
  const [amount, setAmount] = useState('')
  
  const amountNumber = useMemo(() => {
    const number = amount && amount.length > 0 ? new BigNumber(amount) : BIG_ZERO
    return number.multipliedBy(BIG_TEN.pow(tokens.spy.decimals))
  }, [amount])

  const isInputValid = useMemo(() => {
    return amountNumber && amountNumber.isFinite() && amountNumber.gt(BIG_ZERO)
  }, [amountNumber])


  const handleChangeAmount = useCallback(
    (value: string) => {
      setAmount(value)
    },
    [setAmount],
  )

  return (
    <StyledModalContainer minWidth="320px">
      <ModalHeader>
        <ModalTitle>
          <Heading>{t('NFT Signature - Inject SPY')}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      <StyledModalBody>
        <Text>
          {t('Do you want to inject more SPY to this NFT Signature card?')}
        </Text>
        <NFTGradeRow gego={gego} spyDecimals={tokens.spy.decimals}/>
        <Text fontSize="14px" mt="16px">{t('Amount:')}</Text>
        <SPYInput
          enabled
          max='500000'
          value={amount}
          symbol={tokens.spy.symbol}
          onChange={handleChangeAmount}
        />
        <ModalActions>
          <Button scale="md" variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          <Button
            scale="md" variant="primary" width="100%"
            onClick={() => {
              onConfirm(amount)
              onDismiss()
            }}
            disabled={pendingTx || !isInputValid}
          >
            {t('Inject')}
          </Button>
        </ModalActions>
      </StyledModalBody>
    </StyledModalContainer>
  )
}

export default NFTSignatureInjectModal
