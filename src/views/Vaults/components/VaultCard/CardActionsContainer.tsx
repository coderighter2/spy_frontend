import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Text } from '@pancakeswap/uikit'
import { getAddress } from 'utils/addressHelpers'
import { useAppDispatch } from 'state'
import { DeserializedVault } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useERC20 } from 'hooks/useContract'
import { fetchVaultUserDataAsync } from 'state/vaults'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Dots from 'components/Loader/Dots'
import { BIG_ZERO } from 'utils/bigNumber'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'
import useApproveVault from '../../hooks/useApproveVault'

const Action = styled.div`
  padding-top: 16px;
`
export interface VaultWithStakedValue extends DeserializedVault {
  apr?: number
}

interface VaultCardActionsProps {
  vault: VaultWithStakedValue
  account?: string
  addTokenUrl?: string
  cakePrice?: BigNumber
  lpLabel?: string
}

const CardActions: React.FC<VaultCardActionsProps> = ({ vault, account, addTokenUrl, cakePrice, lpLabel }) => {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { pid } = vault
  const { balance: tokenBalance} = useTokenBalance(vault.token.address)
  const { balance: ethBalance } = useGetBnbBalance()
  const [requestedApproval, setRequestedApproval] = useState(false)
  
  const { tokenAllowance,  tokenBalanceInVault, stakedBalance: stakedLPBalance, earnings, pendingEarnings } = vault.userData || {}
  const contractAddress = getAddress(vault.contractAddresses)
  const isApproved = account && (vault.isETH || (tokenAllowance && tokenAllowance.isGreaterThan(0)))
  const dispatch = useAppDispatch()

  const tokenContract = useERC20(vault.token.address)

  const spyAmountInLP = useMemo(() => {
    if (!vault.farm) {
      return BIG_ZERO
    }
    return vault.farm.token.symbol === 'SPY' ?  vault.farm.tokenAmountTotal : vault.farm.tokenAmountTotal.multipliedBy(vault.farm.tokenPriceVsQuote)
  }, [vault])

  const tokenAmountInLP = useMemo(() => {
    if (!vault.farm) {
      return BIG_ZERO
    }
    return vault.farm.token.symbol === 'SPY' ?  vault.farm.tokenAmountTotal.multipliedBy(vault.farm.tokenPriceVsQuote) : vault.farm.tokenAmountTotal
  }, [vault])

  const lpTotalSupply = useMemo(() => {
    return vault.farm ? vault.farm.lpTotalSupply : BIG_ZERO
  }, [vault])

  const { onApprove: onApproveToken } = useApproveVault(getAddress(vault.contractAddresses))

  const handleApproveToken = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApproveToken(tokenContract)
      dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
    } catch (e) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      console.error(e)
    } finally {
      setRequestedApproval(false)
    }
  }, [onApproveToken, dispatch, tokenContract, account, pid, t, toastError])


  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction
        spyAmountInLP={spyAmountInLP}
        tokenAmountInLP={tokenAmountInLP}
        lpTotalSupply={lpTotalSupply}
        stakedLPBalance={stakedLPBalance}
        token={vault.token}
        tokenBalance={vault.isETH ? new BigNumber(ethBalance.toHexString()) : tokenBalance}
        tokenBalanceInVault={tokenBalanceInVault}
        tokenName={vault.symbol}
        lpTokenName={vault.lpSymbol}
        lpAddress={getAddress(vault.lpAddresses)}
        pid={pid}
        addTokenUrl={addTokenUrl}
        contractAddress={contractAddress}
        isETH={vault.isETH}
      />
    ) : (
      <>
      {
        !vault.isETH && (
          <Button mt="8px" width="100%" disabled={requestedApproval} onClick={handleApproveToken}>
            {requestedApproval ? (<Dots>{t('Approving')}</Dots>) : t('Approve %symbol%', {symbol: vault.token.symbol})}
          </Button>
        )
      }
      </>
    )
  }

  return (
    <Action>
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {vault.symbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Earned (pending)')}
        </Text>
      </Flex>
      <HarvestAction
        token={vault.token}
        pendingEarnings={new BigNumber(pendingEarnings)} 
        earnings={new BigNumber(earnings)} 
        pid={pid} 
        contractAddress={contractAddress} 
        isETH={vault.isETH}
      />
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {vault.symbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Staked')}
        </Text>
      </Flex>
      { vault.farm && (
        <>
        {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrStakeButton()}
        </>
      )}
    </Action>
  )
}

export default CardActions
