import React, { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { Text, Flex, LinkExternal, Skeleton, useModal, Button } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from 'utils/bigNumber'
import { useERC20 } from 'hooks/useContract'
import { useAppDispatch } from 'state'
import { fetchVaultsPublicDataAsync, fetchVaultUserDataAsync } from 'state/vaults'
import DepositLPModal from '../DepositLPModal'
import useStakeVault from '../../hooks/useStakeVault'
import useApproveVault from '../../hooks/useApproveVault'

export interface ExpandableSectionProps {
  bscScanAddress?: string
  totalValueFormatted?: string
  lpLabel?: string
  isETH?: boolean
  lpAddress?: string
  contractAddress?: string
  addLiquidityUrl?: string
  account?: string
  pid?: number
  disabled?: boolean
}

const Wrapper = styled.div`
  margin-top: 24px;
`

const StyledLinkExternal = styled(LinkExternal)`
  font-weight: 400;
`

const LinkWrapper = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.5;
  :hover {
    text-decoration: underline;
  }
`

const DetailsSection: React.FC<ExpandableSectionProps> = ({
  bscScanAddress,
  isETH,
  account,
  pid,
  totalValueFormatted,
  lpAddress,
  contractAddress,
  lpLabel,
  addLiquidityUrl,
  disabled
}) => {
  const { t } = useTranslation()
  const { onStakeLP } = useStakeVault(contractAddress, isETH)
  const { onApprove } = useApproveVault(contractAddress)
  const dispatch = useAppDispatch()
  const lpContract = useERC20(lpAddress)
  const handleStakeLP = async (lpAmount: string) => {
    const value = new BigNumber(lpAmount).multipliedBy(BIG_TEN.pow(18))
    await onStakeLP(value.toJSON())
    dispatch(fetchVaultUserDataAsync({ account, pids: [pid] }))
    dispatch(fetchVaultsPublicDataAsync([pid]))
  }

  const handleRequestLPApproval = useCallback(async () => {
    await onApprove(lpContract)
    dispatch(fetchVaultUserDataAsync({account, pids: [pid]}))
    dispatch(fetchVaultsPublicDataAsync([pid]))
  }, [dispatch, onApprove, lpContract, pid, account])

  const [onPresentDepositLP] = useModal(
    <DepositLPModal
      onRequestApproveLP={handleRequestLPApproval}
      onConfirm={handleStakeLP}
      pid={pid}
      lpLabel={lpLabel}
      addTokenUrl={addLiquidityUrl}
    />,
  )

  return (
    <Wrapper>
      <Flex justifyContent="space-between">
        <Text>{t('Total Liquidity')}:</Text>
        {totalValueFormatted ? <Text>{totalValueFormatted}</Text> : <Skeleton width={75} height={25} />}
      </Flex>
      <LinkWrapper onClick={() => !disabled && onPresentDepositLP()}>
        {t('Migrate %symbol% to this pool', {symbol: lpLabel})}
      </LinkWrapper>
      <StyledLinkExternal href={addLiquidityUrl}>{t('Get %symbol%', { symbol: lpLabel })}</StyledLinkExternal>
      <StyledLinkExternal href={bscScanAddress}>{t('View Contract')}</StyledLinkExternal>
      {/* <StyledLinkExternal href={infoAddress}>{t('See Pair Info')}</StyledLinkExternal> */}
    </Wrapper>
  )
}

export default DetailsSection
