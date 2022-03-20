import React, { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Card, Flex, Text, Skeleton, Button, useTooltip, HelpIcon } from '@pancakeswap/uikit'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state'
import { DeserializedVault } from 'state/types'
import { fetchVaultsPublicDataAsync } from 'state/vaults'
import { getBscScanLink } from 'utils'
import { getAddress } from 'utils/addressHelpers'
import { getApy } from 'utils/apr'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useToast from 'hooks/useToast'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import Dots from 'components/Loader/Dots'
import { getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useBNBVaultContract, useCompoundVaultContract } from 'hooks/useContract'
import useCompoundVault from 'views/Vaults/hooks/useCompoundVault'
import useInterval from 'hooks/useInterval'

const StyledCard = styled.div`
    width: 100%;
    max-width: 280px;
    margin: 4px 0px 16px;
    padding: 16px;
    border-radius: 24px;
    border: 1px solid rgba(0,0,0,0.1);
    border-color: ${({ theme }) => 'rgba(0,0,0,0.1)'};
    background: ${({ theme }) => theme.colors.backgroundAlt};
`

interface VaultBountyCardProps {
    vault?: DeserializedVault
    cakePrice?: BigNumber
}

const VaultBountyCard: React.FC<VaultBountyCardProps> = ({ vault, cakePrice }) => {
    
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const dispatch = useAppDispatch()
    const [pendingTx, setPendingTx] = useState(false)
    const bnbVaultContract = useBNBVaultContract(getAddress(vault.contractAddresses))
    const compoundVault = useCompoundVaultContract(getAddress(vault.contractAddresses))
    const { onCompound } = useCompoundVault(vault.isETH ? bnbVaultContract : compoundVault)
    const rawEarningsBalance = vault.rewardForCompounder ? getBalanceAmount(vault.rewardForCompounder, tokens.spy.decimals) : BIG_ZERO
    const displayBalance = rawEarningsBalance.toFixed(3, BigNumber.ROUND_DOWN)
    const earningsBusd = rawEarningsBalance ? rawEarningsBalance.multipliedBy(cakePrice).toFixed(2) : 0
    const bountyEnabled = vault.nearestCompoundingTime && vault.nearestCompoundingTime.toNumber() > 0 && vault.nearestCompoundingTime.toNumber() <= new Date().getTime() / 1000

    const { targetRef, tooltip, tooltipVisible } = useTooltip(
        t('It is a reward for who ever gets to first auto-compound for the vault by clicking on claim! Only the first person who claim it on time can receive it!'),
        { },
    )

    const [countdown, setCountdown] = useState('')

    useInterval(() => {

        if (vault && vault.nearestCompoundingTime) {
            const target = vault.nearestCompoundingTime.toNumber()
            const now = Math.floor(new Date().getTime() / 1000);
            const diffTime = target - now;
            if (diffTime > 0) {
                const duration = diffTime;
                const hour = Math.floor((duration % 86400) / 3600);
                const min = Math.floor((duration % 3600) / 60);
                const sec = duration % 60;

                const hourS = hour < 10 ? `0${hour}`:`${hour}`;
                const minS = min < 10 ? `0${min}`:`${min}`;
                const secS = sec < 10 ? `0${sec}`:`${sec}`;
                setCountdown(`${hourS}:${minS}:${secS}`);
            } else {
                setCountdown('00:00:00');
            }
        } else {
            setCountdown('00:00:00');
        }
    }, 1000)

    const handleClaim = useCallback(async () => {
        try {
            setPendingTx(true)
            await onCompound()
            dispatch(fetchVaultsPublicDataAsync([vault.pid]))
            toastSuccess(t('SPY Bounty'), t('You have claimed the bounty reward successfully'))
        } catch (e) {
            setPendingTx(false)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        } finally {
            setPendingTx(false)
        }
    }, [toastSuccess, toastError, t, dispatch, onCompound, vault])

    return (
        <StyledCard>
            <Flex justifyContent="space-between">
                <Flex flexDirection="column" mr="16px">
                    <Flex alignItems="center">
                        <Text color="secondary" mr="4px">{t('SPY Bounty')}</Text>
                        <span ref={targetRef}>
                            <HelpIcon width="16px" height="16px" color="textSubtle" />
                        </span>
                        {tooltipVisible && tooltip}
                    </Flex>
                    <Text color="primary">{displayBalance}</Text>
                    <Text>~${earningsBusd}</Text>
                </Flex>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                    <Button scale="sm" disabled={!bountyEnabled || pendingTx} onClick={handleClaim}>
                        {pendingTx ? (<Dots>{t('Claiming')}</Dots>) : t('Claim')}
                    </Button>
                    <Text>
                        {countdown}
                    </Text>
                </Flex>
            </Flex>
        </StyledCard>
    )
}

export default VaultBountyCard
