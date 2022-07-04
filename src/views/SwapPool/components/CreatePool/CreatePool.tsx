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
import { useSaleDeployFee } from 'state/swapPool/hooks'
import { fetchSwapPoolPublicDataAsync, fetchSwapPoolUserDataAsync } from 'state/swapPool'
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
import { useCreatePool } from '../../hooks/useCreatePool'

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
    color: ${({ theme }) => theme.colors.text};
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
    softCap?: string,
    hardCap?: string,
    minContribution?: string,
    maxContribution?: string,
    swapStartTime?: string,
    swapEndTime?: string,
    vestingPercent?: string
    vestingInterval?: string
}

enum ContributionType {
    ETH,
    BUSD
}

interface CreatePoolProps {
    routeAddress?: string
}

const CreatePool: React.FC<CreatePoolProps> = ({routeAddress}) => {

    const { t } = useTranslation()
    const { theme } = useTheme()
    const history = useHistory()
    const { account } = useWeb3React()
    const dispatch = useAppDispatch()
    const { toastError, toastSuccess } = useToast()
    const [pendingTx, setPendingTx] = useState(false)
    const [ agreed, setAgreed ] = useState<boolean>(false)
    const [ presentedDesclaimer, setPresentedDesclaimer ] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [ rate, setRate ] = useState<string>('')
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
    const deployFee = useSaleDeployFee()
    const deployFeeNumber = new BigNumber(deployFee)
    const baseTokenDecimals = useMemo(() => {

        return tokens.spy.decimals
    }, [])
    const baseTokenSymbol = useMemo(() => {
        return tokens.spy.symbol
    }, [])

    const minContributionNumer = new BigNumber(minContribution).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    const maxContributionNumer = new BigNumber(maxContribution).multipliedBy(BIG_TEN.pow(baseTokenDecimals))
    const { onCreatePool } = useCreatePool()

    const searchToken: Token = tokens.minitokie
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

    const swapAmountNumber = useMemo(() => {
        if (!rateNumber || !rateNumber.isFinite() || !hardCapNumber || !hardCapNumber.isFinite()) {
            return BIG_ZERO
        }

        return hardCapNumber.multipliedBy(rateNumber).div(BIG_TEN.pow(rateDecimalsNumber))
    }, [rateNumber, rateDecimalsNumber, hardCapNumber])

    const depositAmountNumber = useMemo(() => {
        if (swapAmountNumber.eq(0)) {
            return BIG_ZERO
        }
        return swapAmountNumber
    }, [swapAmountNumber])

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
        if (!agreed && !presentedDesclaimer) {
            setPresentedDesclaimer(true)
            onPresentDesclaimer()
        }
        
    }, [agreed, presentedDesclaimer, onPresentDesclaimer])

    const handleStartDateChange = (date: Date, event) => {
        setStartDate(date)
        setFormError({...formError, swapStartTime: null})
    }

    const handleEndDateChange = (date: Date, event) => {
        setEndDate(date)
        setFormError({...formError, swapEndTime: null})
    }

    const validateInputs = useCallback(() => {
        let valid = true
        const error: FormErrors = {}

        if (!title || title.length === 0) {
            error.title = "Title is required";
            valid = false;
        }

        if (!searchToken) {
            valid = false;
            error.token = "Token address is invalid.";
        } else {

            if (!rateNumber || !rateNumber.isFinite() || rateNumber.eq(0)) {
                valid = false;
                error.rate = "Swap rate is required.";
            } else if (!rateDecimalsNumber || !rateDecimalsNumber.isFinite() || rateDecimalsNumber.lt(0)) {
                valid = false;
                error.rate = "Swap rate is invalid .";
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
            error.swapStartTime = "Swap start date is required.";
        } else if (startDate <= new Date()) {
            valid = false;
            error.swapStartTime = "Swap start date should be earlier than current time.";
        }

        if (!endDate) {
            valid = false;
            error.swapEndTime = "Swap start date is required.";
        }

        if (startDate && endDate && startDate >= endDate) {
            valid = false;
            error.swapEndTime = "Swap end date should be later than swao start date.";
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
    }, [wallet, searchToken, rateNumber, rateDecimalsNumber, softCapNumber, hardCapNumber, startDate, endDate, minContributionNumer, maxContributionNumer, depositAmountNumber, vestingInterval, vestingPercent, vestingEnabled, title])

    const handleCreate = useCallback(async () => {
        if (!validateInputs()) {
            return
        }
        try {
            setPendingTx(true)
            const saleAddress = await onCreatePool({
                title,
                feeAmount: deployFee, 
                wallet, 
                token: searchToken.address, 
                baseToken: tokens.spy.address, 
                rate: rateNumber.toJSON(), 
                rateDecimals:rateDecimalsNumber.toJSON(), 
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
            dispatch(fetchSwapPoolPublicDataAsync())
            dispatch(fetchSwapPoolUserDataAsync({account}))
            history.push(`/swap-pools/view/${saleAddress}`)
            // onPresentSuccess()
        } catch (e) {
          toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
          console.error(e)
        } finally {
          setPendingTx(false)
        }
    }, [onCreatePool, dispatch, toastError, t, validateInputs, history, account, deployFee, wallet, searchToken, rateNumber, rateDecimalsNumber, softCapNumber, hardCapNumber, startDate, endDate, minContributionNumer, maxContributionNumer, whitelistEnabled, vestingInterval, vestingPercent, vestingEnabled, title])

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
                                    tooltip={t('Enter your swap price in %symbol%: (If I pay 1 %symbol%, how many tokens do I get?)', {symbol: baseTokenSymbol})}
                                    error={formError.rate}
                                    >
                                    <StyledNumericalInput placeholder={t('Swap Rate, ex. 500')} value={rate} onUserInput={
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
                                    tooltip={t('Enter the swap start time in your local time.')}
                                    error={formError.swapStartTime}
                                    >
                                    <DateTimePicker 
                                    onChange={handleStartDateChange}
                                    selected={startDate}
                                    timeIntervals={1}
                                    placeholderText="Swap Start Time"/>
                                </StyledWrapperWithTooltip>
                            </InputWrap>
                            <InputWrap>
                                <StyledWrapperWithTooltip
                                    tooltip={t('Enter the swap end time in your local time.')}
                                    error={formError.swapEndTime}
                                    >
                                    <DateTimePicker 
                                    onChange={handleEndDateChange}
                                    selected={endDate}
                                    timeIntervals={1}
                                    placeholderText="Swap End Time"/>
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
                                {t('Swap Pool:')}
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
                                    <Text fontSize="14px" color="text" mr="16px">
                                        {t('Your %symbol% balance', {symbol: tokens.minitokie.symbol})}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {getFullDisplayBalance(balance, tokens.minitokie.decimals)} {tokens.minitokie.symbol}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="text" mr="16px">
                                        {t('Estimated Funds Raised')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {hardCap} {baseTokenSymbol}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="text" mr="16px">
                                        {t('Total Tokens Used')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {depositAmountNumber && searchToken? getFullDisplayBalance(depositAmountNumber, searchToken.decimals) : ''} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="text" mr="16px">
                                        {t('Tokens For Pool')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        {swapAmountNumber && searchToken? getFullDisplayBalance(swapAmountNumber, searchToken.decimals) : ''} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="text" mr="16px">
                                        {t('Swap Rate')}:
                                    </Text>
                                    <Text fontSize="14px" color="primary">
                                        1 {baseTokenSymbol} = {rate} {searchToken ? searchToken.symbol : ''}
                                    </Text>
                                </li>
                                <li style={{display:'flex'}}>
                                    <Text fontSize="14px" color="text" mr="16px">
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

export default CreatePool