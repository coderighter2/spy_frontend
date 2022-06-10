import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { useTranslation } from 'contexts/Localization'
import { Text, Flex,  Message, Progress, Button } from '@pancakeswap/uikit'
import { JSBI, Token, TokenAmount } from '@pancakeswap/sdk'
import { StyledNumericalInput } from 'components/StyledControls'
import Dots from 'components/Loader/Dots'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { formatBigNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { SALE_FINALIZE_DEADLINE } from 'config/constants'
import { useSaleMinVote } from 'state/launchpad/hooks'
import useInterval from 'hooks/useInterval'
import useToast from 'hooks/useToast'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useToken } from 'hooks/Tokens'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { BigNumber} from 'bignumber.js'
import tokens from 'config/constants/tokens'
import SaleTimer from './SaleTimer'
import { PublicSaleData, SaleContractVersion } from '../../types'
import { useBuySale, useClaimRefundSale, useClaimSale, useUnlockSale } from '../../hooks/useBuySale'
import { getSaleUserData } from '../../hooks/getSales'

export interface SaleActionSectionProps {
    sale: PublicSaleData
    account: string
    onReloadSale?: () => void
}

const SaleActionSection: React.FC<SaleActionSectionProps> = ({account, sale, onReloadSale}) => {

    const { t } = useTranslation()
    const { toastError, toastSuccess } = useToast()
    const { balance: spyBalance, fetchStatus: spyFetchStatus } = useTokenBalance(tokens.spy.address)
    const [value, setValue] = useState('')
    const [lockValue, setLockValue] = useState('')
    const [text, setText] = useState('')
    const [pendingTx, setPendingTx] = useState(false)
    const [unlockingTx, setUnlockingTx] = useState(false)
    const [emergencyWithdrawing, setEmergencyWithdrawing] = useState(false)
    const [claimingRefund, setClaimingRefund] = useState(false)
    const [expired, setExpired] = useState(sale.finalized)
    const [buyable, setBuyable] = useState(false)
    const [showBuy, setShowbuy] = useState(false)
    const [showClaim, setShowClaim] = useState(false)
    const [whitelisted, setWhitelisted] = useState(true)

    const token = useToken(sale.token)

    const baseToken = useToken(sale.useETH ? undefined : sale.baseToken)
    const {balance: baseTokenBalance} = useTokenBalance(sale.useETH ? undefined : sale.baseToken)
    const {balance: BNBBalance} = useGetBnbBalance()
    const baseTokenSymbol = useMemo(() => {
        if (sale.useETH) {
            return 'CRO'
        }
        if (baseToken) {
            return baseToken.symbol
        }

        return ''
    }, [sale, baseToken])

    const baseTokenDecimals = useMemo(() => {
        if (sale.useETH) {
            return 18
        }
        if (baseToken) {
            return baseToken.decimals
        }

        return -1
    }, [sale, baseToken])

    const [loadContribution, setLoadContribution] = useState(false)

    const [contribution, setContribution] = useState<BigNumber|null>(null)
    const [purchasedAmount, setPurchasedAmount] = useState<BigNumber|null>(null)
    const [claimableTokenAmount, setClaimableTokenAmount] = useState<BigNumber|null>(null)
    const [claimableFreeAmount, setClaimableFreeAmount] = useState<BigNumber|null>(null)
    const [voteAmount, setVoteAmount] = useState<BigNumber|null>(null)
    const [voteUnlockedAmount, setVoteUnlockedAmount] = useState<BigNumber|null>(null)
    const [airdropAmount, setAirdropAmount] = useState<BigNumber|null>(null)
    const [claimedAmount, setClaimedAmount] = useState<BigNumber|null>(null)
    const [airdropClaimedAmount, setAirdropClaimedAmount] = useState<BigNumber|null>(null)

    const minVote = useSaleMinVote()

    const claimableAmount = useMemo(() => {
        if (!claimableFreeAmount || !claimableTokenAmount) {
            return null
        }

        return claimableTokenAmount.plus(claimableFreeAmount)
    }, [claimableFreeAmount, claimableTokenAmount])

    useEffect(() => {
        const fetchContribution = async () =>  {
            const {contribution:contribution_, purchasedAmount: purchasedAmount_, claimedAmount:claimedAmount_, claimableTokenAmount: claimableTokenAmount_, airdropClaimedAmount:airdropClaimedAmount_, airdropAmount: airdropAmount_, voteUnlockedAmount: voteUnlockedAmount_, voteAmount: voteAmount_, claimableFreeAmount: claimableFreeAmount_, whitelisted: whitelisted_} = await getSaleUserData(sale.address, account)
            setContribution(contribution_)
            setPurchasedAmount(purchasedAmount_)
            setClaimableTokenAmount(claimableTokenAmount_)
            setClaimableFreeAmount(claimableFreeAmount_)
            setAirdropClaimedAmount(airdropClaimedAmount_)
            setVoteAmount(voteAmount_)
            setVoteUnlockedAmount(voteUnlockedAmount_)
            setAirdropAmount(airdropAmount_)
            setClaimedAmount(claimedAmount_)
            setWhitelisted(whitelisted_)
            setLoadContribution(false)
        }

        fetchContribution()
    }, [account, sale.address, loadContribution])

    const maxNumber = useMemo(() => {
        const remaining = sale.cap.minus(sale.weiRaised)
        const remainingContrib = contribution && contribution.isFinite() ? sale.maxContribution.minus(contribution) : sale.maxContribution

        return remaining.gt(remainingContrib) ? remainingContrib : remaining;
    }, [sale, contribution])

    const valueNumber = baseTokenDecimals < 0 ? BIG_ZERO : new BigNumber(value).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    const lockValueNumber = lockValue === '' ? BIG_ZERO : new BigNumber(lockValue).multipliedBy(BIG_TEN.pow(tokens.spy.decimals))

    const [approval, approveCallback] = useApproveCallback(baseToken && valueNumber.gt(0) && valueNumber.isFinite() ? new TokenAmount(baseToken, JSBI.BigInt(value)) : undefined, sale.address)

    const [approvalSPY, approveSPYCallback] = useApproveCallback(new TokenAmount(tokens.spy, JSBI.BigInt(100)), sale.address)

    const { onBuySale, onBuySaleETH } = useBuySale(sale.address)
    const { onClaimSale } = useClaimSale(sale.address)
    const { onUnlockVotes } = useUnlockSale(sale.address)
    const { onClaimRefundSale, onEmergencyWithdraw } = useClaimRefundSale(sale.address)


    useInterval(() => {
        const now = Math.floor(new Date().getTime() / 1000);
        if (now > sale.closingTime + SALE_FINALIZE_DEADLINE) {
            setExpired(true)
        }
        if (now > sale.closingTime || sale.finalized) {
            setBuyable(false)
            setShowbuy(false)
            setShowClaim(true)
        } else if (now > sale.openingTime && sale.weiRaised.lt(sale.cap)) {
            setBuyable(true)
            setShowbuy(true)
            setShowClaim(false)
        } else {
            setBuyable(false)
            setShowbuy(true)
            setShowClaim(false)
        }
    }, 1000)


    const handleClickMax = useCallback(() => {
        if (baseTokenDecimals >= 0) {
            setValue(getFullDisplayBalance(maxNumber, baseTokenDecimals))
        }
    }, [baseTokenDecimals, maxNumber])


    const handleClickLockMax = useCallback(() => {
        if (spyBalance && spyBalance.isFinite()) {
            setLockValue(getFullDisplayBalance(spyBalance, tokens.spy.decimals))
        }
    }, [spyBalance])

    const handleBuy = useCallback(async () => {
        try {
            setPendingTx(true)
            const receipt = sale.useETH ? await onBuySaleETH(account, valueNumber.toString(), lockValueNumber.toString()) : await onBuySale(account, valueNumber.toString(), lockValueNumber.toString())
            onReloadSale()
            setLoadContribution(!loadContribution)
            toastSuccess(
            `${t('Purchased')}!`,
            t('You have been purchased %amount% tokens successfully', {
                amount: getFullDisplayBalance(valueNumber.multipliedBy(sale.rate).div(BIG_TEN.pow(sale.rateDecimals)), token.decimals)
            }),
            )
        } catch (e) {
            console.log('e', e)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))

        } finally {
            setPendingTx(false)
        }
    }, [toastError, toastSuccess, t, onBuySale, onBuySaleETH, onReloadSale, sale, valueNumber, lockValueNumber, account, loadContribution, token])

    const handleClaim = useCallback(async () => {
        try {
            const contribution_ = contribution
            setPendingTx(true)
            await onClaimSale(account)
            onReloadSale()
            setLoadContribution(!loadContribution)
            toastSuccess(
            `${t('Success')}!`,
            t('You have been claimed your tokens successfully', {
                amount: getFullDisplayBalance(contribution_.multipliedBy(sale.rate), token.decimals)
            }),
            )
        } catch (e) {
            console.log('e', e)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))

        } finally {
            setPendingTx(false)
        }
    }, [toastError, toastSuccess, t, onClaimSale, onReloadSale, sale, contribution, token, account, loadContribution])

    const handleUnlockVote = useCallback(async () => {
        try {
            setUnlockingTx(true)
            await onUnlockVotes()
            setLoadContribution(!loadContribution)
            toastSuccess(
            `${t('Success')}!`,
            t('You have unlocked successfully'),
            )
        } catch (e) {
            console.log('e', e)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))

        } finally {
            setUnlockingTx(false)
        }
    }, [toastError, toastSuccess, t, onUnlockVotes, loadContribution])

    const handleClaimRefund = useCallback(async () => {
        try {
            setClaimingRefund(true)
            await onClaimRefundSale(account)
            onReloadSale()
            setLoadContribution(!loadContribution)
            toastSuccess(
            `${t('Success')}!`,
            t('You have been claimed the refund successfully'),
            )
        } catch (e) {
            console.log('e', e)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))

        } finally {
            setClaimingRefund(false)
        }
    }, [toastError, toastSuccess, t, onClaimRefundSale, onReloadSale, account, loadContribution])

    const handleEmergencyWithdraw = useCallback(async () => {
        try {
            setEmergencyWithdrawing(true)
            await onEmergencyWithdraw()
            onReloadSale()
            setLoadContribution(!loadContribution)
            toastSuccess(
            `${t('Success')}!`,
            t('You have been withdrawed the fund successfully'),
            )
        } catch (e) {
            console.log('e', e)
            toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))

        } finally {
            setEmergencyWithdrawing(false)
        }
    }, [toastError, toastSuccess, t, onEmergencyWithdraw, onReloadSale, loadContribution])



    const renderApprovalOrPurchaseButton = () => {

        if (!sale.deposited) {
            return (
                <Button scale="sm" disabled>
                    {t('Incomplete Setup')}
                </Button>
            )
        }

        if (sale.whitelistEnabled && !whitelisted) {
            return (
                <Button scale="sm" disabled>
                    {t('You are not in whitelist')}
                </Button>
            )
        }
        const showApproveSpy = lockValueNumber.gt(BIG_ZERO) && approvalSPY !== ApprovalState.APPROVED
        const showApproveToken = baseToken && approval !== ApprovalState.APPROVED

        if (showApproveSpy && showApproveToken) {
            return (
                <Flex justifyContent="space-between" mt="8px">
                    <Button mr="16px" disabled={approval === ApprovalState.PENDING || approval === ApprovalState.UNKNOWN} onClick={approveCallback}>
                    {approval === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve BUSD')}
                    </Button>
                    <Button disabled={approvalSPY === ApprovalState.PENDING || approvalSPY === ApprovalState.UNKNOWN} onClick={approveSPYCallback}>
                    {approvalSPY === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve SPY')}
                    </Button>
                </Flex>
            )
        }
        if (showApproveSpy) {
            return (
                <Button mt="8px" width="100%" disabled={approvalSPY === ApprovalState.PENDING || approvalSPY === ApprovalState.UNKNOWN} onClick={approveSPYCallback}>
                {approvalSPY === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve SPY')}
                </Button>
            )
        }
        if (showApproveToken) {
            return (
                <Button mt="8px" width="100%" disabled={approval === ApprovalState.PENDING || approval === ApprovalState.UNKNOWN} onClick={approveCallback}>
                {approval === ApprovalState.PENDING ? (<Dots>{t('Approving')}</Dots>) : t('Approve BUSD')}
                </Button>
            )
        }

        return (
            <Button 
                scale="sm" 
                disabled={!buyable || pendingTx || !valueNumber || !valueNumber.isFinite() || valueNumber.eq(0) || valueNumber.gt(maxNumber) || !lockValueNumber.isFinite() || (lockValueNumber.gt(BIG_ZERO) && lockValueNumber.lt(minVote))} 
                onClick={handleBuy}
            >
                { pendingTx ? (<Dots>{t('Purchasing')}</Dots>) : (sale.whitelistEnabled && !whitelisted) ? t('You are not in whitelist') : !sale.deposited ? t('Incomplete Setup') : t('Purchase')}
            </Button>
        )
    }

    return (
        <>
            <Flex flexDirection="column" width="100%">
                <Message variant="warning" mb="24px">
                    <Text>
                    {t(
                        "Make sure the website is app.spy-token.io!",
                    )}
                    </Text>
                </Message>
                { sale.canceled ? (
                    <Flex justifyContent="center" mt="16px" mb="16px">
                        <Text fontSize="16px">
                            { t('Canceled') }
                        </Text>
                    </Flex>
                ) : !sale.finalized && (
                    <SaleTimer startTime={sale.openingTime} endTime={sale.closingTime} />
                )}
                <Flex flexDirection="column" mt="8px">
                    <Progress primaryStep={sale.weiRaised.multipliedBy(100).div(sale.cap).toNumber()} />
                    <Flex justifyContent="space-between">
                        { baseTokenDecimals >= 0 && (
                            <>
                            <Text fontSize="12px">
                                {getFullDisplayBalance(sale.weiRaised, baseTokenDecimals)} {baseTokenSymbol}
                            </Text>
                            <Text fontSize="12px">
                                {getFullDisplayBalance(sale.cap, baseTokenDecimals)} {baseTokenSymbol}
                            </Text>
                            </>
                        )}
                    </Flex>
                </Flex>
                { showClaim && account === sale.owner && (
                    <></>
                )}
                {contribution && contribution.isFinite() && baseTokenDecimals >= 0 && (
                <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                    {t('Your Contribution: %amount% %currency%', {amount: getFullDisplayBalance(contribution, baseTokenDecimals), currency:baseTokenSymbol})}
                </Text>
                )}
                {voteAmount && voteAmount.isFinite() && voteUnlockedAmount && voteUnlockedAmount.isFinite() && (
                    <>
                    <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                        {t('Your SPY Locked: %amount% %currency%', {amount: voteAmount ? getFullDisplayBalance(voteAmount, tokens.spy.decimals) : '0', currency:tokens.spy.symbol})}
                    </Text>
                    <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                        {t('Your SPY Unlocked: %amount% %currency%', {amount: voteUnlockedAmount ? getFullDisplayBalance(voteUnlockedAmount, tokens.spy.decimals) : '0', currency:tokens.spy.symbol})}
                    </Text>
                    </>
                )}
                { showClaim && (!expired || sale.finalized) && sale.weiRaised.gte(sale.goal) && voteAmount && voteUnlockedAmount && voteAmount.gt(voteUnlockedAmount) && (
                    <Flex justifyContent="center" mt="8px">
                        { !account ? (
                            <ConnectWalletButton mt="8px" width="100%" />
                        ) : (
                            <Button scale="sm" disabled={unlockingTx || !sale.finalized } onClick={handleUnlockVote}>
                                { unlockingTx ? (<Dots>{t('Unlocking')}</Dots>) : t('Unlock SPY')}
                            </Button>
                        )
                        }
                    </Flex>
                    )}
                { sale.finalized && token && (
                    <>
                    <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                        {t('Claimed(Purchased) : %amount% %currency% / %total% %currency%', {amount: claimedAmount ? getFullDisplayBalance(claimedAmount, token.decimals) : '', total:purchasedAmount ? getFullDisplayBalance(purchasedAmount, token.decimals) : '', currency:token.symbol})}
                    </Text>

                    <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                        {t('Claimed(Free Airdrop) : %amount% %currency% / %total% %currency%', {amount: airdropClaimedAmount ? getFullDisplayBalance(airdropClaimedAmount, token.decimals) : '', total:airdropAmount ? getFullDisplayBalance(airdropAmount, token.decimals) : '', currency:token.symbol})}
                    </Text>
                    <Text fontSize="14px" fontStyle="bold" mt="8px" textAlign="center">
                        {t('Claimable Now: %amount% %currency%', {amount: claimableAmount ? getFullDisplayBalance(claimableAmount, token.decimals) : '', currency:token.symbol})}
                    </Text>
                    </>
                )}

                { sale.version !== SaleContractVersion.DEFAULT && !!account && !sale.canceled && showBuy && contribution && contribution.isFinite() && contribution.gt(0) && (
                    <>
                    <Flex justifyContent="center" mt="8px">
                        <Button 
                            scale="sm" 
                            disabled={!buyable || emergencyWithdrawing || !contribution || contribution.lte(0)} 
                            onClick={handleEmergencyWithdraw}
                        >
                            { emergencyWithdrawing ? (<Dots>{t('Processing')}</Dots>) : t('Emergency Withdraw')}
                        </Button>
                    </Flex>
                    {voteAmount && voteAmount.gt(BIG_ZERO) && (
                        <Text fontSize="12px" fontStyle="bold" mt="4px" color="primary" textAlign="center">
                            {t('You SPY locked will be sent to you when withdraw your purchase')}
                        </Text>
                    )}
                    </>
                )}
                { (sale.canceled || (sale.finalized && sale.weiRaised.lt(sale.goal)) || (!sale.finalized && expired)) && contribution && contribution.isFinite() && contribution.gt(0) && (
                    <Flex justifyContent="center" mt="8px">
                        { !account ? (
                            <ConnectWalletButton mt="8px" width="100%" />
                        ) : (
                        <Button 
                            scale="sm" 
                            disabled={claimingRefund || !contribution || contribution.lte(0)} 
                            onClick={handleClaimRefund}
                        >
                            { claimingRefund ? (<Dots>{t('Claiming')}</Dots>) : t('Claim Refund')}
                        </Button>
                        )}
                    </Flex>
                )}
                { !sale.canceled && (
                    <>

                    { showBuy && (
                        <>
                        <Flex justifyContent="space-between">
                            <Text fontSize="14px" fontStyle="bold" mt="8px">
                                {t('Amount (max: %amount% %currency%)', {amount: getFullDisplayBalance(maxNumber, baseTokenDecimals), currency:baseTokenSymbol})}
                            </Text>
                            <Text fontSize="14px" fontStyle="bold" mt="8px">
                                {t('Balance: %amount% %currency%', {amount: sale.useETH ? formatBigNumber(BNBBalance) : getFullDisplayBalance(baseTokenBalance, baseTokenDecimals, 0), currency:baseTokenSymbol})}
                            </Text>
                        </Flex>
                        
                        <Flex position="relative">
                            <StyledNumericalInput
                                value={value}
                                onUserInput={(val) => setValue(val)} />
                            <Button scale="xs" style={{position: 'absolute', right: '12px', top: '10px'}} onClick={handleClickMax}>{t('MAX')}</Button>
                        </Flex>

                        <Flex justifyContent="space-between">
                            <Text fontSize="14px" fontStyle="bold" mt="8px">
                                {t('Lock Amount (min: %amount% %currency% or zero)', {amount: minVote, currency:tokens.spy.symbol})}
                            </Text>
                            <Text fontSize="14px" fontStyle="bold" mt="8px">
                                {t('Balance: %amount% %currency%', {amount: getFullDisplayBalance(spyBalance, tokens.spy.decimals), currency:tokens.spy.symbol})}
                            </Text>
                        </Flex>
                        
                        <Flex position="relative">
                            <StyledNumericalInput
                                value={lockValue}
                                onUserInput={(val) => setLockValue(val)} />
                            <Button scale="xs" style={{position: 'absolute', right: '12px', top: '10px'}} onClick={handleClickLockMax}>{t('MAX')}</Button>
                        </Flex>
                        <Text fontSize="12px" fontStyle="bold" mt="4px" color="primary">
                            {t('You will get free tokens based on your SPY locked against others. You can unlock your SPY once the presale ends. This is optional.', {amount: minVote, currency:tokens.spy.symbol})}
                        </Text>
                        <Flex justifyContent="center" mt="8px">
                        {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrPurchaseButton()}
                        </Flex>
                        </>
                    )}
                    { showClaim && (!expired || sale.finalized) && sale.weiRaised.gte(sale.goal) && (
                    <Flex justifyContent="center" mt="8px">
                        { !account ? (
                            <ConnectWalletButton mt="8px" width="100%" />
                        ) : (
                            <Button scale="sm" disabled={pendingTx || !claimableAmount || !claimableAmount.isFinite() || claimableAmount.eq(0) || !sale.finalized } onClick={handleClaim}>
                                { pendingTx ? (<Dots>{t('Claiming')}</Dots>) : t('Claim')}
                            </Button>
                        )
                        }
                    </Flex>
                    )}
                    </>
                )}
            </Flex>
        </>
    )
}

export default SaleActionSection