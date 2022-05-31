import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { useHistory } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { Text, Flex, Box, Input, Heading, Button, Radio, useModal, useTooltip, HelpIcon } from '@pancakeswap/uikit'
import { JSBI, Token, TokenAmount } from '@pancakeswap/sdk'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'
import { useAppDispatch } from 'state'
import { useSaleDeployFee } from 'state/launchpad/hooks'
import { fetchLaunchpadPublicDataAsync, fetchLaunchpadUserDataAsync } from 'state/launchpad'
import { StyledAddressInput, StyledNumericalInput, StyledTextInput, StyledWrapperWithTooltip } from 'components/StyledControls'
import RadioWithText from 'components/RadioWithText'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { useToken } from 'hooks/Tokens'
import useTokenBalance from 'hooks/useTokenBalance'
import { useApproveCallback } from 'hooks/useApproveCallback'
import { isAddress } from 'utils'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import { getFullDisplayBalance } from 'utils/formatBalance'
import Dots from 'components/Loader/Dots'
import ConnectWalletButton from 'components/ConnectWalletButton'
import DateTimePicker from 'components/DateTimePicker'
import DesclaimerModal from './DesclaimerModal'
import { useCreateSale } from '../../hooks/useCreateSale'

const InputWrap = styled.div`
    padding: 8px 4px;
`
const RadioGroup = styled(Flex)`
  align-items: center;
  margin-right: 16px;
  margin-top: 8px;
  cursor: pointer;
`

const StyledList = styled.ul`
    margin-top: 16px;
    color: ${({ theme }) => theme.colors.secondary};
    list-style: none;
    font-size: 14px;
    line-height: 1.2;
    > li {
        margin-top: 8px;
        position: relative;
        padding-left: 16px;
        ::before {
            content: '-';
            position: absolute;
            left: 0;
        }
    }
`

interface FormErrors {
    title?: string,
    token?: string,
    wallet?: string,
    rate?: string,
    listingRate?: string,
    liquidityPercent?: string,
    softCap?: string,
    hardCap?: string,
    minContribution?: string,
    maxContribution?: string,
    presaleStartTime?: string,
    presaleEndTime?: string,
    vestingPercent?: string
    vestingInterval?: string
    logo?: string
}

enum ContributionType {
    ETH,
    BUSD
}

interface CreateProps {
    routeAddress?: string
}

const CreateSale: React.FC<CreateProps> = ({routeAddress}) => {

    const { t } = useTranslation()
    const { theme } = useTheme()
    const history = useHistory()
    const busdToken: Token = tokens.busd
    const { account } = useWeb3React()
    const dispatch = useAppDispatch()
    const { toastError, toastSuccess } = useToast()
    const [pendingTx, setPendingTx] = useState(false)
    const [ agreed, setAgreed ] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [ contributionType, setContributionType] = useState<ContributionType>(ContributionType.ETH)
    const [ presentedDesclaimer, setPresentedDesclaimer ] = useState<boolean>(false)
    const [ rate, setRate ] = useState<string>('')
    const [ listingRate, setListingRate ] = useState<string>('')
    const [ liquidityPercent, setLiquidityPercent ] = useState<string>('')
    const [ softCap, setSoftCap ] = useState<string>('')
    const [ hardCap, setHardCap ] = useState<string>('')
    const [ minContribution, setMinContribution ] = useState<string>('')
    const [ maxContribution, setMaxContribution ] = useState<string>('')
    const [ vestingEnabled, setVestingEnabled ] = useState<boolean>(true)
    const [ vestingInterval, setVestingInterval ] = useState<string>('168')
    const [ vestingPercent, setVestingPercent ] = useState<string>('10')
    const [startDate, setStartDate] = useState<Date|null>(null)
    const [endDate, setEndDate] = useState<Date|null>(null)
    const [wallet, setWallet] = useState<string|null>(null)
    const [formError, setFormError] = useState<FormErrors>({})
    const [whitelistEnabled, setWhitelistEnabled] = useState<boolean>(false)
    const {
        targetRef: whitelistTargetRef,
        tooltip: whitelistTooltipElement,
        tooltipVisible: whitelistTooltipVisible,
      } = useTooltip("In a private sale, only whitelisted investors can contribute.", {
        placement: 'bottom',
      })
    const {
        targetRef: purchaseTypeTargetRef,
        tooltip: purchaseTypeTooltipElement,
        tooltipVisible: purchaseTypeTooltipVisible,
    } = useTooltip("Your investors can contribute with BNB or BUSD", {
        placement: 'bottom',
    })
    const deployFee = useSaleDeployFee()
    const deployFeeNumber = new BigNumber(deployFee)
    const baseTokenDecimals = useMemo(() => {
        if (contributionType === ContributionType.ETH) {
            return 18
        }

        return busdToken.decimals
    }, [contributionType, busdToken])
    const baseTokenSymbol = useMemo(() => {
        if (contributionType === ContributionType.ETH) {
            return 'BNB'
        }

        return busdToken.symbol
    }, [contributionType, busdToken])

    const minContributionNumer = new BigNumber(minContribution).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    const maxContributionNumer = new BigNumber(maxContribution).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    const { onCreateSale } = useCreateSale()

    const [tokenAddress, setTokenAddress] = useState<string>('')
    const searchToken: Token = useToken(tokenAddress)
    const {balance} = useTokenBalance(searchToken ? searchToken.address : undefined)

    const rateDecimalsNumber = useMemo(() => {
        const res = new BigNumber(rate)
        if (!searchToken || !res || !res.isFinite() || res.eq(0)) {
            return BIG_ZERO
        }
        if (baseTokenDecimals < searchToken.decimals) {
            return new BigNumber(res.decimalPlaces())
        }
        return new BigNumber(res.decimalPlaces() + baseTokenDecimals - searchToken.decimals)
    }, [rate, searchToken, baseTokenDecimals])

    const rateNumber = useMemo(() => {
        const res = new BigNumber(rate)
        if (!searchToken || !res || !res.isFinite() || res.eq(0)) {
            return BIG_ZERO
        }

        if (baseTokenDecimals < searchToken.decimals) {
            return res.multipliedBy(BIG_TEN.pow(res.decimalPlaces() + searchToken.decimals - baseTokenDecimals))
        }

        return res.multipliedBy(BIG_TEN.pow(res.decimalPlaces()))
    }, [rate, searchToken, baseTokenDecimals])

    const listingRateDecimalsNumber = useMemo(() => {
        const res = new BigNumber(listingRate)
        if (!searchToken || !res || !res.isFinite() || res.eq(0)) {
            return BIG_ZERO
        }
        if (baseTokenDecimals < searchToken.decimals) {
            return new BigNumber(res.decimalPlaces())
        }
        return new BigNumber(res.decimalPlaces() + baseTokenDecimals - searchToken.decimals)
    }, [listingRate, searchToken, baseTokenDecimals])

    const listingRateNumber = useMemo(() => {
        const res = new BigNumber(listingRate)
        if (!searchToken || !res || !res.isFinite() || res.eq(0)) {
            return BIG_ZERO
        }

        if (baseTokenDecimals < searchToken.decimals) {
            return res.multipliedBy(BIG_TEN.pow(res.decimalPlaces() + searchToken.decimals - baseTokenDecimals))
        }

        return res.multipliedBy(BIG_TEN.pow(res.decimalPlaces()))
    }, [listingRate, searchToken, baseTokenDecimals])

    const liquidityPercentNumber = useMemo(() => {
        return new BigNumber(liquidityPercent)
    }, [liquidityPercent])

    const softCapNumber = useMemo(() => {
        const res = new BigNumber(softCap).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
        if (res && res.isFinite() && res.lte(BIG_TEN.pow(baseTokenDecimals - 3))) {
            return BIG_TEN.pow(baseTokenDecimals - 3)
        }
        return res
    }, [softCap, baseTokenDecimals])

    const hardCapNumber = useMemo(() => {
        return new BigNumber(hardCap).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    }, [hardCap, baseTokenDecimals])

    const presaleAmountNumber = useMemo(() => {
        if (!rateNumber || !rateNumber.isFinite() || !hardCapNumber || !hardCapNumber.isFinite()) {
            return BIG_ZERO
        }

        return hardCapNumber.multipliedBy(rateNumber).div(BIG_TEN.pow(rateDecimalsNumber))
    }, [rateNumber, rateDecimalsNumber, hardCapNumber])

    const liquidityAmountNumber = useMemo(() => {
        if (!listingRateNumber || !listingRateNumber.isFinite() || !liquidityPercentNumber || !liquidityPercentNumber.isFinite() || !hardCapNumber || !hardCapNumber.isFinite()) {
            return BIG_ZERO
        }

        return hardCapNumber.multipliedBy(liquidityPercentNumber).div(100).multipliedBy(listingRateNumber).div(BIG_TEN.pow(listingRateDecimalsNumber))
    }, [listingRateNumber, listingRateDecimalsNumber, liquidityPercentNumber, hardCapNumber])

    const depositAmountNumber = useMemo(() => {
        if (presaleAmountNumber.eq(0)) {
            return BIG_ZERO
        }
        return presaleAmountNumber.plus(liquidityAmountNumber)
    }, [presaleAmountNumber, liquidityAmountNumber])

    const [onPresentDesclaimer] = useModal(
        <DesclaimerModal onAgree={() => {
            setAgreed(true)
        }} onCancel={() => {
            history.replace('/sales')
        }}/>,
        false,
        false
    )

    useEffect(() => {
        if (routeAddress && routeAddress.length > 0 && isAddress(routeAddress)) {
            setTokenAddress(routeAddress)
        }
    }, [routeAddress])

    useEffect(() => {
        if (!agreed && !presentedDesclaimer) {
            setPresentedDesclaimer(true)
            onPresentDesclaimer()
        }
        
    }, [agreed, presentedDesclaimer, onPresentDesclaimer])

    const handleStartDateChange = (date: Date, event) => {
        setStartDate(date)
        setFormError({...formError, presaleStartTime: null})
    }

    const handleEndDateChange = (date: Date, event) => {
        setEndDate(date)
        setFormError({...formError, presaleEndTime: null})
    }

    const validateInputs = useCallback(() => {
        let valid = true
        const error: FormErrors = {}
        if (!title || title.length === 0) {
            error.title = "Title is required";
            valid = false;
        }

        if (!tokenAddress || tokenAddress.length === 0) {
            error.token = "Token address is required.";
            valid = false;
        } else if (!searchToken) {
            valid = false;
            error.token = "Token address is invalid.";
        } else {

            if (!rateNumber || !rateNumber.isFinite() || rateNumber.eq(0)) {
                valid = false;
                error.rate = "Presale rate is required.";
            } else if (!rateDecimalsNumber || !rateDecimalsNumber.isFinite() || rateDecimalsNumber.lt(0)) {
                valid = false;
                error.rate = "Presale rate is invalid .";
            }

            if (!listingRateNumber || !listingRateNumber.isFinite() || listingRateNumber.eq(0)) {
                valid = false;
                error.listingRate = "Listing rate is required.";
            } else if (!listingRateDecimalsNumber || !listingRateDecimalsNumber.isFinite() || listingRateDecimalsNumber.lt(0)) {
                valid = false;
                error.listingRate = "Listing rate is invalid .";
            }

            if (!error.rate && !error.listingRate && listingRateNumber.div(BIG_TEN.pow(listingRateDecimalsNumber)).gte(rateNumber.div(BIG_TEN.pow(rateDecimalsNumber)))) {
                valid = false;
                error.listingRate = "Listing rate must be smaller than presale rate.";
            }


            if (!depositAmountNumber || !depositAmountNumber.isFinite() || depositAmountNumber.eq(0)) {
                valid = false;
                error.maxContribution = "Hard cap is invalid.";
            }
        }

        if (!isAddress(wallet)) {
            valid = false;
            error.wallet = "Wallet address is invalid.";
        }

        if (!liquidityPercentNumber || !liquidityPercentNumber.isFinite()) {
            valid = false;
            error.liquidityPercent = "Liquidity percent is required.";
        } else if ( liquidityPercentNumber.gt(100)) {
            valid = false;
            error.liquidityPercent = "Liquidity percent must be less than 100.";
        }

        if (!softCapNumber || !softCapNumber.isFinite() || softCapNumber.eq(0)) {
            valid = false;
            error.softCap = "Soft cap is required.";
        }

        if (!hardCapNumber || !hardCapNumber.isFinite() || hardCapNumber.eq(0)) {
            valid = false;
            error.hardCap = "Hard cap is required.";
        }

        if (softCapNumber && hardCapNumber && softCapNumber.gte(hardCapNumber)) {
            valid = false;
            error.softCap = "Soft cap cannot be greater than hard cap.";
        }

        if (!minContributionNumer || !minContributionNumer.isFinite() || minContributionNumer.eq(0)) {
            valid = false;
            error.minContribution = "Min contribution is required.";
        }

        if (!maxContributionNumer || !maxContributionNumer.isFinite() || maxContributionNumer.eq(0)) {
            valid = false;
            error.maxContribution = "Max contribution is required.";
        }

        if (minContributionNumer && maxContributionNumer && minContributionNumer.gte(maxContributionNumer)) {
            valid = false;
            error.softCap = "Min contribution cannot be greater than max contribution.";
        }

        if (!startDate) {
            valid = false;
            error.presaleStartTime = "Presale start date is required.";
        } else if (startDate <= new Date()) {
            valid = false;
            error.presaleStartTime = "Presale start date should be earlier than current time.";
        }

        if (!endDate) {
            valid = false;
            error.presaleEndTime = "Presale start date is required.";
        }

        if (startDate && endDate && startDate >= endDate) {
            valid = false;
            error.presaleEndTime = "Presale end date should be later than presale start date.";
        }

        if (vestingEnabled) {
            if (!vestingInterval || parseInt(vestingInterval) <= 0) {
                valid = false;
                error.vestingInterval = "Vesting Interval is required";
            }
    
            if (!vestingPercent || parseInt(vestingPercent) <= 0) {
                valid = false;
                error.vestingPercent = "Vesting Percent is required";
            } else if (parseInt(vestingPercent) > 100) {
                valid = false;
                error.vestingPercent = "Vesting Percent must be equal or less than 100";
            }
        } else {
            error.vestingInterval = undefined
            error.vestingPercent = undefined
        }
        setFormError(error)
        return valid
    }, [wallet, searchToken, rateNumber, rateDecimalsNumber, listingRateNumber, listingRateDecimalsNumber, liquidityPercentNumber, softCapNumber, hardCapNumber, startDate, endDate, minContributionNumer, maxContributionNumer, depositAmountNumber, tokenAddress, vestingInterval, vestingPercent, vestingEnabled, title])


    const handleCreate = useCallback(async () => {
        if (!validateInputs()) {
            return
        }
        try {
            setPendingTx(true)
            let baseTokenAddress = AddressZero
            if (contributionType === ContributionType.BUSD) {
                baseTokenAddress = busdToken.address
            }
            const saleAddress = await onCreateSale({
                title,
                feeAmount: deployFee, 
                wallet, 
                token: searchToken.address, 
                baseToken: baseTokenAddress, 
                rate: rateNumber.toJSON(), 
                rateDecimals:rateDecimalsNumber.toJSON(), 
                listingRate:listingRateNumber.toJSON(), 
                listingRateDecimals:listingRateDecimalsNumber.toJSON(), 
                liquidityPercent:liquidityPercentNumber.toJSON(), 
                goal:softCapNumber.toJSON(), 
                cap:hardCapNumber.toJSON(), 
                openingTime:Math.floor(startDate.getTime() / 1000), 
                closingTime:Math.floor(endDate.getTime() / 1000), 
                minContribution:minContributionNumer.toJSON(), 
                maxContribution:maxContributionNumer.toJSON(), 
                vestingPercent: vestingEnabled ? parseInt(vestingPercent) : 100,
                vestingInterval: vestingEnabled ? parseInt(vestingInterval) : 0,
                whitelistEnabled,
                
            })
            dispatch(fetchLaunchpadPublicDataAsync())
            dispatch(fetchLaunchpadUserDataAsync({account}))
            history.push(`/sales/view/${saleAddress}`)
            // onPresentSuccess()
        } catch (e) {
          toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
          console.error(e)
        } finally {
          setPendingTx(false)
        }
    }, [onCreateSale, dispatch, toastError, t, validateInputs, history, account, deployFee, wallet, searchToken, rateNumber, rateDecimalsNumber, listingRateNumber, listingRateDecimalsNumber, liquidityPercentNumber, softCapNumber, hardCapNumber, startDate, endDate, minContributionNumer, maxContributionNumer, whitelistEnabled, contributionType, busdToken, vestingInterval, vestingPercent, vestingEnabled, title])

    const renderApprovalOrCreateButton = () => {
        return  (
            <Button
            disabled={ pendingTx }
            onClick={handleCreate}
            width="100%"
            >
            {pendingTx ? (<Dots>{t('Creating')}</Dots>) : t('Create')}
            </Button>
        )
    }

    return (
        <>
            <Flex flexDirection="column">
                <Flex flexDirection="row" justifyContent="center" mt="24px">
                    <Flex flexDirection={["column", "column", "column", "row"]} maxWidth="960px" width="100%">
                        <Flex flexDirection="column" flex="1" order={[1, 1, 1, 0]}>

                            <InputWrap>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter the presale title. e.g. My Token Presale.', {symbol: baseTokenSymbol})}
                                        error={formError.title}
                                        >
                                        <StyledTextInput
                                            value={title} 
                                            placeholder={t('Title')}
                                            onUserInput={(value) => {
                                                setTitle(value)
                                                setFormError({...formError, title: null})
                                            }} />
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                            <InputWrap>
                                    <Flex  alignItems="center">
                                        <Text color="primary">
                                            {t('Contribution Currency:')}
                                        </Text>
                                        <span ref={purchaseTypeTargetRef}>
                                            <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
                                        </span>
                                        { purchaseTypeTooltipVisible && purchaseTypeTooltipElement}
                                    </Flex>
                                    <Flex>
                                        <Flex flex="1">
                                            <RadioWithText
                                                checked={contributionType === ContributionType.ETH}
                                                onClick={() => setContributionType(ContributionType.ETH)}
                                                text={t('BNB')}
                                                />
                                        </Flex>
                                        <Flex flex="1">
                                            <RadioWithText
                                                checked={contributionType === ContributionType.BUSD}
                                                onClick={() => setContributionType(ContributionType.BUSD)}
                                                text={t('BUSD')}
                                                />
                                        </Flex>

                                    </Flex>
                                </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    error={formError.token}
                                    >
                                <StyledAddressInput 
                                    value={tokenAddress} 
                                    placeholder={t('Token Address')}
                                    onUserInput={(value) => {
                                        setTokenAddress(value)
                                        setFormError({...formError, token: null})
                                    }} />
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            { searchToken && (
                                <>
                                <Flex flexDirection="column">
                                    <Flex>
                                        <Text fontSize="14px" color="secondary" mr="24px">{t('Token name')}: </Text>
                                        <Text fontSize="14px" bold color="primary">{searchToken.name} </Text>
                                    </Flex>
                                    <Flex>
                                        <Text fontSize="14px" color="secondary" mr="24px">{t('Token symbol')}: </Text>
                                        <Text fontSize="14px" bold color="primary">{searchToken.symbol} </Text>
                                    </Flex>
                                    <Flex>
                                        <Text fontSize="14px" color="secondary" mr="24px">{t('Token decimals')}: </Text>
                                        <Text fontSize="14px" bold color="primary">{searchToken.decimals} </Text>
                                    </Flex>
                                    { balance && (
                                    <Flex>
                                        <Text fontSize="14px" color="secondary" mr="8px">{t('Balance')}: </Text>
                                        <Text fontSize="14px" bold color="primary">{getFullDisplayBalance(balance, searchToken.decimals)}</Text>
                                    </Flex>
                                    )}
                                </Flex>
                                </>
                            )}
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter your wallet address which you want to receive %symbol% from your investors.', {symbol: baseTokenSymbol})}
                                    error={formError.wallet}
                                    >
                                    <StyledAddressInput
                                        value={wallet} 
                                        placeholder={t('Wallet Address')}
                                        onUserInput={(value) => {
                                            setWallet(value)
                                            setFormError({...formError, wallet: null})
                                        }} />
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter your presale price in %symbol%: (If I pay 1 %symbol%, how many tokens do I get?)', {symbol: baseTokenSymbol})}
                                    error={formError.rate}
                                    >
                                    <StyledNumericalInput placeholder={t('Presale Rate, ex. 500')} value={rate} onUserInput={
                                        (value) => {
                                        setRate(value)
                                        setFormError({...formError, rate: null})
                                    }}/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <Flex flexDirection={["column", null, null, "row"]}>
                                <InputWrap style={{flex: 1}}>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter your desired softcap in %symbol% (For a small or near 0 soft cap set your softcap to 0.001)', {symbol: baseTokenSymbol})}
                                        error={formError.softCap}
                                            >
                                        <StyledNumericalInput placeholder={t('Soft Cap ex.50 %symbol%', {symbol: baseTokenSymbol})} value={softCap} onUserInput={(value) => {
                                            setSoftCap(value)
                                            setFormError({...formError, softCap: null})
                                        } }/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                                <InputWrap style={{flex: 1}}>

                                    <StyledWrapperWithTooltip
                                            tooltip={t('Enter your desired hardcap in %symbol%', {symbol: baseTokenSymbol})}
                                            error={formError.hardCap}
                                                >
                                        <StyledNumericalInput placeholder={t('Hard Cap ex.100 %symbol%', {symbol: baseTokenSymbol})} value={hardCap} onUserInput={(value) => {
                                            setHardCap(value)
                                            setFormError({...formError, hardCap: null})
                                        }}/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                            </Flex>
                            <Flex flexDirection={["column", null, null, "row"]}>
                                <InputWrap style={{flex: 1}}>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter your desired minimum contribution in %symbol%. ex. 0.1 %symbol', {symbol: baseTokenSymbol})}
                                        error={formError.minContribution}
                                            >
                                        <StyledNumericalInput placeholder={t('Min contribution')} style={{marginRight: "4px"}} value={minContribution} onUserInput={(value) => {
                                            setMinContribution(value)
                                            setFormError({...formError, minContribution: null})
                                        }}/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                                <InputWrap style={{flex: 1}}>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter your desired maximum contribution in %symbol%. ex. 2 %symbol%', {symbol: baseTokenSymbol})}
                                        error={formError.maxContribution}
                                            >
                                        <StyledNumericalInput placeholder={t('Max Contribution')} style={{marginLeft: "4px"}} value={maxContribution} onUserInput={(value) => {
                                            setMaxContribution(value)
                                            setFormError({...formError, maxContribution: null})
                                        }}/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                            </Flex>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter your desired Liquidity % (0 ~ 100)')}
                                    error={formError.liquidityPercent}
                                        >
                                    <StyledNumericalInput placeholder={t('Liquidity (%)')} value={liquidityPercent} onUserInput={(value) => {
                                        setLiquidityPercent(value)
                                        setFormError({...formError, liquidityPercent: null})
                                    }}/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter your desired listing price in %symbol%: (If I pay 1 %symbol%, how many tokens do I get?)', {symbol: baseTokenSymbol})}
                                    error={formError.listingRate}
                                        >
                                    <StyledNumericalInput placeholder={t('Listing Rate')} value={listingRate} onUserInput={(value) => {
                                        setListingRate(value)
                                        setFormError({...formError, listingRate: null})
                                    }}/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter the presale start time in your local time.')}
                                    error={formError.presaleStartTime}
                                    >
                                    <DateTimePicker 
                                    onChange={handleStartDateChange}
                                    selected={startDate}
                                    timeIntervals={1}
                                    placeholderText="Presale Start Time"/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter the presale end time in your local time.')}
                                    error={formError.presaleEndTime}
                                    >
                                    <DateTimePicker 
                                    onChange={handleEndDateChange}
                                    selected={endDate}
                                    timeIntervals={1}
                                    placeholderText="Presale End Time"/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <Flex  alignItems="center">
                                    <Text color="primary">
                                        {t('Sale type:')}
                                    </Text>
                                    <span ref={whitelistTargetRef}>
                                        <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
                                    </span>
                                    { whitelistTooltipVisible && whitelistTooltipElement}
                                </Flex>
                                <Flex>
                                    <Flex flex="1">
                                        <RadioWithText
                                            checked={!whitelistEnabled}
                                            onClick={() => setWhitelistEnabled(false)}
                                            text={t('Public')}
                                            />
                                    </Flex>
                                    <Flex flex="1">
                                        <RadioWithText
                                            checked={whitelistEnabled}
                                            onClick={() => setWhitelistEnabled(true)}
                                            text={t('Private')}
                                            />
                                    </Flex>
                                </Flex>
                            </InputWrap>
                            <InputWrap>
                                <Flex  alignItems="center">
                                    <Text color="primary">
                                        {t('Vesting:')}
                                    </Text>
                                </Flex>
                                <Flex>
                                    <Flex flex="1">
                                        <RadioWithText
                                            checked={vestingEnabled}
                                            onClick={() => setVestingEnabled(true)}
                                            text={t('Enabled')}
                                            />
                                    </Flex>
                                    <Flex flex="1">
                                        <RadioWithText
                                            checked={!vestingEnabled}
                                            onClick={() => setVestingEnabled(false)}
                                            text={t('Disabled')}
                                            />
                                    </Flex>
                                </Flex>
                            </InputWrap>
                            { vestingEnabled && (
                                <>
                                <InputWrap>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter the vesting interval in hours. e.g. customers can claim 10% tokens every 2 weeks = 168 hours')}
                                        error={formError.vestingInterval}
                                            >
                                        <StyledNumericalInput placeholder={t('Vesting Interval: e.g. 24 hours')} style={{marginLeft: "4px"}} value={vestingInterval} onUserInput={(value) => {
                                                setVestingInterval(value)
                                                setFormError({...formError, vestingInterval: null})
                                            }}/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                                <InputWrap>
                                    <StyledWrapperWithTooltip
                                        tooltip={t('Enter the vesting percent. e.g. customers can claim 10% tokens every 2 weeks')}
                                        error={formError.vestingPercent}
                                            >
                                        <StyledNumericalInput placeholder={t('Percent: e.g. 10%')} style={{marginLeft: "4px"}} value={vestingPercent} onUserInput={(value) => {
                                                setVestingPercent(value)
                                                setFormError({...formError, vestingPercent: null})
                                            }}/>
                                    </StyledWrapperWithTooltip>
                                </InputWrap>
                                </>
                            )}

                            <Flex flexDirection="row" justifyContent="center" mt="12px" mb="24px">
                                {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrCreateButton()}
                            </Flex>
                        </Flex>
                        <Flex flexDirection="column" order={[0, 0, 0, 1]} margin={["0 0px 24px 0px", "0px 0px 24px 0px", "0px 0px 24px 0px", "0px 0px 0px 48px"]} maxWidth={["100%", "100%", "100%", "50%"]}>
                            <Heading color="primary" mt="8px">
                                {t('Presale:')}
                            </Heading>
                            <StyledList>
                                <li>
                                {t('This process is entirely decentralized, we cannot be held responsible for incorrect entry of information or be held liable for anything related to your use of our platform.')}
                                </li>
                                <li>
                                {t('Deploy Fee: %amount% %currency%', {amount: getFullDisplayBalance(deployFeeNumber), currency: 'BNB'})}
                                </li>
                                
                            </StyledList>

                            <Heading color="primary" mt="24px">
                                {t('Calculator:')}
                            </Heading>
                            <StyledList>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Estimated Funds Raised')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {hardCap} {baseTokenSymbol}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Total Tokens Used')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {depositAmountNumber && searchToken? getFullDisplayBalance(depositAmountNumber, searchToken.decimals) : ''} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Tokens For Pre Sale')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {presaleAmountNumber && searchToken? getFullDisplayBalance(presaleAmountNumber, searchToken.decimals) : ''} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Pre Sale Rate Per Token')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        1 {baseTokenSymbol} = {rate} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Listing Price Per Token')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        1 {baseTokenSymbol} = {listingRate} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('% of Funds Raised To LP')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {liquidityPercent} %
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="secondary" mr="16px">
                                        {t('Vesting')}:
                                    </Text>
                                    {vestingEnabled ? (
                                        <Text fontSize="14px" color="primary">
                                            {vestingPercent}% per {vestingInterval} hours
                                        </Text>
                                    ) : (
                                        <Text fontSize="14px" color="primary">
                                            {t('Disabled')}
                                        </Text>

                                    )}
                                </li>
                            </StyledList>
                            
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}

export default CreateSale