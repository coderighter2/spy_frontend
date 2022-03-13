import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Text } from '@pancakeswap/uikit'
import { ETHER, JSBI, TokenAmount } from '@pancakeswap/sdk'
import { getAddress } from 'utils/addressHelpers'
import tokens from 'config/constants/tokens'
import { useAppDispatch } from 'state'
import { DeserializedVault } from 'state/types'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useERC20 } from 'hooks/useContract'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Dots from 'components/Loader/Dots'
import { BIG_TEN } from 'utils/bigNumber'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'

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
  const { pid, lpAddresses } = vault
  const { balance: tokenBalance} = useTokenBalance(vault.token.address)
  const { balance: ethBalance } = useGetBnbBalance()
  const { tokenBalance : lpBalance, stakedBalance: stakedLPBalance, earnings } = vault.userData || {}
  const lpAddress = getAddress(lpAddresses)
  const contractAddress = getAddress(vault.contractAddresses)
  const [spyApproval, spyApproveCallback] = useApproveCallback(new TokenAmount(tokens.spy, JSBI.BigInt(BIG_TEN.pow(24))), contractAddress)
  const [tokenApproval, tokenApproveCallback] = useApproveCallback(!vault.isETH && vault.token ? new TokenAmount(vault.token, JSBI.BigInt(BIG_TEN.pow(24))) : undefined, contractAddress)
  const isApproved = account && (vault.isETH || tokenApproval === ApprovalState.APPROVED)
  const dispatch = useAppDispatch()

  const lpContract = useERC20(lpAddress)

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction
        stakedLPBalance={stakedLPBalance}
        token={vault.token}
        tokenBalance={vault.isETH ? new BigNumber(ethBalance.toHexString()) : tokenBalance}
        tokenName={vault.symbol}
        lpTokenName={vault.lpSymbol}
        pid={pid}
        apr={vault.apr}
        lpLabel={lpLabel}
        cakePrice={cakePrice}
        addTokenUrl={addTokenUrl}
        contractAddress={contractAddress}
        isETH={vault.isETH}
      />
    ) : (
      <>
      {/* {spyApproval !== ApprovalState.APPROVED && (
        <Button mt="8px" width="100%" disabled={spyApproval === ApprovalState.PENDING} onClick={spyApproveCallback}>
          {spyApproval === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve SPY')}
        </Button>
      )} */}
      {!vault.isETH && tokenApproval !== ApprovalState.APPROVED && (
      <Button mt="8px" width="100%" disabled={tokenApproval === ApprovalState.PENDING} onClick={tokenApproveCallback}>
        {spyApproval === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve %symbol%', {symbol: vault.token.symbol})}
      </Button>
      )}
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
          {t('Earned')}
        </Text>
      </Flex>
      <HarvestAction earnings={new BigNumber(earnings)} pid={pid} contractAddress={contractAddress} isETH={vault.isETH}/>
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
