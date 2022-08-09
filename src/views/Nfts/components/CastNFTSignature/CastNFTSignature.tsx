import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { JSBI, TokenAmount } from '@pancakeswap/sdk'
import { Flex, Heading, Text, Button, useModal, Spinner, Stepper } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ModalActions } from 'components/Modal'
import Dots from 'components/Loader/Dots'
import { useTranslation } from 'contexts/Localization'
import tokens from 'config/constants/tokens'
import useTokenBalance,  { FetchStatus } from 'hooks/useTokenBalance'
import { useERC20 } from 'hooks/useContract'
import { useToken } from 'hooks/Tokens'
import useToast from 'hooks/useToast'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useAppDispatch } from 'state'
import { DeserializedNFTGego } from 'state/types'
import { useNFTCastAllowance, useNFTSignatureFactoryData } from 'state/nft/hooks'
import { fetchNFTSignatureUserBalanceDataAsync, fetchNFTUserBalanceDataAsync } from 'state/nft'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { getNFTSignatureMintProxyAddress } from 'utils/addressHelpers'
import useApproveCastNFT from '../../hooks/useApproveCastNFT'
import {useCastNFTSignature, usePurchaseNFTSignature} from '../../hooks/useCastNFT'
import CastConfirmModal from './CastConfirmModal'
import CastedModal from './CastedModal'
import SPYInput from '../SPYInput'
import SignatureInput from './SignatureInput'

const Wrapper = styled.div`
    flex: 1 1 0;
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    padding: 16px;
    ${({ theme }) => theme.mediaQueries.md} {
        max-width: 50%;
        min-width: 50%;
    }
`

const Group = styled(Flex)`
    padding: 24px;
    border-radius: 12px;
    height: 100%;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const BalanceWrapper = styled(Flex)`
    margin: 12px 0px 36px 0px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const SpyInputWrapper = styled.div `{
  padding: 12px;
}`
const ModalActionsWrapper = styled.div `{
  padding: 12px;
}`


interface CastNFTSignatureProps {
    account?: string
}

const CastNFTSignature: React.FC<CastNFTSignatureProps> = ({account}) => {
    const { t } = useTranslation()
    const { toastError } = useToast()
    const [amount, setAmount] = useState('')
    const [purchasedNFT, setPurchasedNFT] = useState<boolean>(false)
    const dispatch = useAppDispatch()

    const [approval, approveCallback] = useApproveCallback(new TokenAmount(tokens.busd, JSBI.BigInt(BIG_TEN.pow(10).multipliedBy(BIG_TEN))), getNFTSignatureMintProxyAddress())
    const [pendingTx, setPendingTx] = useState(false)
    const { balance: busdBalance, fetchStatus: busdFetchStatus } = useTokenBalance(tokens.busd.address)
    const factoryData = useNFTSignatureFactoryData()
    const costToken = useToken(factoryData.costToken)
    const spyToken = useERC20(tokens.spy.address)
    const { onPurchaseNFTSignatures } = usePurchaseNFTSignature()

    const handleChange = useCallback(
        (value: string) => {
        setAmount(value)
        },
        [setAmount],
    )

    const priceNumber = useMemo(() => {
      const amountNumber = parseInt(amount)
      if (Number.isNaN(amountNumber)) {
        return 0
      }
      if (!costToken) {
        return 0
      }
      if (factoryData.mintCostDiscountQuantity.lte(BIG_ZERO)) {
        return 0
      }
      return amountNumber * factoryData.mintCost.div(BIG_TEN.pow(costToken.decimals)).toNumber() - Math.floor(amountNumber / factoryData.mintCostDiscountQuantity.toNumber()) * factoryData.mintCostDiscount.div(BIG_TEN.pow(costToken.decimals)).toNumber()
    }, [amount, factoryData, costToken])

    const maxMintQuantity = useMemo(() => {
      if (!factoryData) {
        return 10
      }
      return Math.min(factoryData.maxMintQuantityPerClick.toNumber(), Math.max(0, factoryData.maxMintQuantity.minus(factoryData.mintedQuantity).toNumber()))
    }, [factoryData])

    const handlePurchaseNFT = useCallback(async() => {

        try {
            setPendingTx(true)
            await onPurchaseNFTSignatures(factoryData.activeRuleId.toNumber(), amount)
            setPurchasedNFT(true)
            dispatch(fetchNFTSignatureUserBalanceDataAsync({account}))
          } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
            console.error(e)
          } finally {
            setPendingTx(false)
          }
    }, [onPurchaseNFTSignatures, toastError, t, dispatch, account, amount, factoryData])

    const handleCastedModalDismiss = useCallback(() => {
      setPurchasedNFT(false);
    }, [setPurchasedNFT])
    
    const [onPresentCastedModal] = useModal(
      <CastedModal amount={amount} customOnDismiss={handleCastedModalDismiss}/>,
      false,
      true,
      "CastedNFTModal"
    )

    useEffect(() => {
      if (purchasedNFT) {
        onPresentCastedModal()
      }
      // exhaustive deps disabled as the useModal dep causes re-render loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [purchasedNFT])

    const renderApprovalOrCastButton = () => {
      return (
        <Flex>
          { approval !== ApprovalState.APPROVED && (
          <Flex flex={1} mr="12px">
            <Button scale="md" variant="primary" width="100%" disabled={approval === ApprovalState.PENDING || approval === ApprovalState.UNKNOWN} onClick={approveCallback}>
            {approval === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve BUSD')}
            </Button>
          </Flex>
          )}
          <Flex flex={1}>
            <Button
                disabled={pendingTx || approval !== ApprovalState.APPROVED}
                onClick={handlePurchaseNFT}
                width="100%"
              >
              {pendingTx ? t('Processing...') : t('Buy NFT Signature')}
            </Button>
          </Flex>
        </Flex>
      )
    }
    return (
        <>
            <Wrapper>
                <Group flexDirection="column">
                    <Heading padding="12px 0px 12px 2px">{t('Cast NFT Signatures')}</Heading>

                    <Text padding="12px 0px">
                    {t("We're introducing Crypto %nft%s as a new feature. Users can buy %nft%s with unique characteristics and different rarities then stake it in the %nft% Pools to generate rewards. Issue, trade %nft%s and participate in auctions!", {nft: 'NFT Signature'})}
                    </Text>
                    <Flex mb="12px">
                      <Text>{t('Price (based on the input):')}</Text>
                      <Text color="primary" ml="12px">{priceNumber} {costToken ? costToken.symbol : ''}</Text>
                    </Flex>
                    <SignatureInput
                        enabled
                        value={amount}
                        max={`${maxMintQuantity}`}
                        symbol="Signatures"
                        onChange={handleChange}
                    />
                    <ModalActions>
                    {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrCastButton()}
                    </ModalActions>
                </Group>
                
            </Wrapper>
        
        </>
    )
}

export default CastNFTSignature