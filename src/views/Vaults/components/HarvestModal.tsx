import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Button, Modal, LinkExternal, IconButton, ModalHeader, ModalTitle, Heading, CloseIcon, ModalContainer, ModalBody } from '@pancakeswap/uikit'
import { TokenImage } from 'components/TokenImage'
import { ETHER, Token } from '@pancakeswap/sdk'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount, getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import useBUSDPrice from 'hooks/useBUSDPrice'
import tokens from 'config/constants/tokens'
import { TokenInfoChanges } from '@uniswap/token-lists'
import Dots from 'components/Loader/Dots'
import { usePriceCakeBusd } from 'state/farms/hooks'

const OptionGroup = styled(Flex).attrs({alignItems:"center"})<{selected?: boolean}>`
  cursor: pointer;
  margin: 4px 0px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  border-color: ${({ selected, theme }) => (selected ? theme.colors.primary  : 'rgba(0,0,0,0.1)')};
  background: ${({ theme }) => theme.colors.background};
`

interface HarvestModalProps {
  spyAmount: BigNumber
  tokenAmount: BigNumber
  token: Token
  onConfirm: (receiveToken: boolean) => void
  onDismiss?: () => void
}

const HarvestModal: React.FC<HarvestModalProps> = ({
  onConfirm,
  onDismiss,
  spyAmount,
  tokenAmount,
  token
}) => {

  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [receiveToken, setReceiveToken] = useState(false)

  const spyPrice = usePriceCakeBusd()
  const tokenPrice = useBUSDPrice(token)
  const tokenSymbol = token.symbol === 'WBNB' ? ETHER.symbol : token.symbol
  const spyBalance = getFullDisplayBalance(spyAmount, tokens.spy.decimals)
  const spyBusdBalance = spyPrice ? getBalanceAmount(spyAmount, tokens.spy.decimals).multipliedBy(new BigNumber(spyPrice.toFixed())).toFixed(3) : '0.000'
  const tokenBalance =  getFullDisplayBalance(tokenAmount, token.decimals, 3)
  const tokenBusdBalance = tokenPrice ? getBalanceAmount(tokenAmount, token.decimals).multipliedBy(new BigNumber(tokenPrice.toFixed())).toFixed(3) : '0.000'

  const handleHarvest = useCallback(async () => {
    try {
      setPendingTx(true)
      await onConfirm(receiveToken)
      toastSuccess(t('Harvested!'), t('You have harvested successfully in the vault'))
      onDismiss()
    } catch(e) {
      const error = e as any
      const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
      toastError(
        t('Error'),
        msg,
      )
    } finally {
      setPendingTx(false)
    }
  }, [toastSuccess, toastError, t, onConfirm, onDismiss, receiveToken])

  if (!agreed) {
    return (
      <ModalContainer minWidth="300px">
        <ModalHeader>
          <ModalTitle  mt="8px">
            <Heading>{t('Harvest From compounded amount?')}</Heading>
          </ModalTitle>
          <IconButton variant="text" color="primary" onClick={onDismiss}>
            <CloseIcon width="20px" color="text" />
          </IconButton>
        </ModalHeader>
        <ModalBody p="24px 24px 12px" maxWidth="400px" width="100%">
          <Flex flexDirection="column" >
            <Text textAlign="justify">
              {t('Are you sure that you want to harvest? Once you harvest, it\'ll harvest all compounded amount, you will not benefit from auto compound magic.')}
            </Text>
          </Flex>
          <ModalActions>
            <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
              {t('Cancel')}
            </Button>
            <Button width="100%" onClick={() => setAgreed(true)}>
              {t('Confirm')}
            </Button>
          </ModalActions>
        </ModalBody>

      </ModalContainer>
    )
  }

  return (
    <Modal title={t('Harvest')} onDismiss={onDismiss}>
      <Flex flexDirection="column" width="320px" maxWidth="100%">
        <Text textAlign="center" mb="12px">
          {t('Choose option to Harvest your Token')}
        </Text>
        <OptionGroup 
          selected={!receiveToken}
          onClick={() => setReceiveToken(false)}
        >
          <Flex width="60px">
            <TokenImage token={tokens.spy} width={48} height={48}/>
          </Flex>
          <Flex flexDirection="column" justifyContent="center">
            <Text>{t('Harvest %symbol%', {symbol: tokens.spy.symbol})}</Text>
            <Text color="primary">{spyBalance} {tokens.spy.symbol}</Text>
            <Text color="secondary">~${spyBusdBalance}</Text>
          </Flex>
        </OptionGroup>
        <OptionGroup 
          selected={receiveToken}
          onClick={() => setReceiveToken(true)}
        >
          <Flex width="60px">
            <TokenImage token={token} width={48} height={48}/>
          </Flex>
          <Flex flexDirection="column" justifyContent="center">
            <Text>{t('Harvest %symbol%', {symbol: tokenSymbol})}</Text>
            <Text color="primary">{tokenBalance} {tokenSymbol}</Text>
            <Text color="secondary">~${tokenBusdBalance}</Text>
          </Flex>
        </OptionGroup>
      </Flex>
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        <Button
          width="100%"
          disabled={
            pendingTx 
          }
          onClick={handleHarvest}
        >
          {pendingTx ? (<Dots>{t('Harvesting')}</Dots>) : t('Harvest')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default HarvestModal
