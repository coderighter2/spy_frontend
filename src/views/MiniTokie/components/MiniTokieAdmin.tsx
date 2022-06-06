import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, Button } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import useTheme from 'hooks/useTheme'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { StyledAddressInput } from 'components/StyledControls'
import Dots from 'components/Loader/Dots'
import { isAddress } from 'utils'
import { MiniTokieInfo } from '../hooks/getTokie'
import { useExcludeFromFee, useMiniTokieToggleAntiBot, useMiniTokieToggleFee } from '../hooks/useMiniTokieAdmin'

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    margin-top: 24px;
    padding: 24px 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;

    ${({ theme }) => theme.mediaQueries.sm} {
        padding: 24px 24px;
    }
`

const Row = styled(Flex).attrs({flexDirection:"row", justifyContent:"space-between"})`
`

const Label = styled(Text)`
    font-size: 13px;
`

const Value = styled(Text)`
    font-size: 13px;
`

const Error = styled(Text)`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.failure};
`

interface MiniTokieAdminProps {
    info?: MiniTokieInfo
}


const MiniTokieAdmin: React.FC<MiniTokieAdminProps> = ({info}) => {

    const { t } = useTranslation()
    const { toastError, toastSuccess } = useToast()
    const { theme } = useTheme()
    const { account } = useActiveWeb3React()

    const [pendingTx, setPendingTx] = useState(false)
    const [enablingFee, setEnablingFee] = useState(false)
    const [disablingFee, setDisablingFee] = useState(false)
    const [enablingAntiBot, setEnablingAntiBot] = useState(false)
    const [disablingAntiBot, setDisablingAntiBot] = useState(false)
    const [excludingFromFee, setExcludingFromFee] = useState(false)
    const [includingFromFee, setIncludingFromFee] = useState(false)
    const [isAddressValid, setAddressValid] = useState(true)
    const [address, setAddress] = useState('')

    const {onToggleFee} = useMiniTokieToggleFee()
    const {onToggleAntiBot} = useMiniTokieToggleAntiBot()
    const {onInclude, onExclude} = useExcludeFromFee()

    const isAdmin = useMemo(() => {
        return info && info.owner.toLowerCase() === account.toLowerCase()
    }, [info, account])

    const handleToggleFee = useCallback(async (enabled: boolean) => {
        try {
            setPendingTx(true)
            if (enabled) {
                setEnablingFee(true)
            } else {
                setDisablingFee(true)
            }

            await onToggleFee(enabled)
            toastSuccess(t('Success'))
        } catch (e) {
            console.log('e', e)
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            if (enabled) {
                setEnablingFee(false)
            } else {
                setDisablingFee(false)
            }
            setPendingTx(false)
        }
    }, [t, toastError, toastSuccess, onToggleFee])

    const handleToggleAntiBot = useCallback(async (enabled: boolean) => {
        try {
            setPendingTx(true)
            if (enabled) {
                setEnablingAntiBot(true)
            } else {
                setDisablingAntiBot(true)
            }

            await onToggleAntiBot(enabled)
            toastSuccess(t('Success'))
        } catch (e) {
            console.log('e', e)
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            if (enabled) {
                setEnablingAntiBot(false)
            } else {
                setDisablingAntiBot(false)
            }
            setPendingTx(false)
        }
    }, [t, toastError, toastSuccess, onToggleAntiBot])

    const handleExcludeFromFee = useCallback(async () => {
        const validatedAdress = isAddress(address)
        if (!validatedAdress) {
            setAddressValid(false)
            return
        }
        try {
            setPendingTx(true)
            setExcludingFromFee(true)
            await onExclude(validatedAdress)
            toastSuccess(t('Success'))
        } catch (e) {
            console.log('e', e)
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setExcludingFromFee(false)
            setPendingTx(false)
        }
    }, [t, toastError, toastSuccess, onExclude, address])

    const handleIncludeFromFee = useCallback(async () => {
        const validatedAdress = isAddress(address)
        if (!validatedAdress) {
            setAddressValid(false)
            return
        }
        try {
            setPendingTx(true)
            setIncludingFromFee(true)
            await onInclude(validatedAdress)
            toastSuccess(t('Success'))
        } catch (e) {
            console.log('e', e)
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setIncludingFromFee(false)
            setPendingTx(false)
        }
    }, [t, toastError, toastSuccess, onInclude, address])

    return (
        <Wrapper>
            <Flex flexDirection="column">
                <Heading paddingY="12px">
                    {t('Management')}
                </Heading>
            </Flex>
            
            <Flex flexDirection="column">
                <Text>{t('Fee')}</Text>
                <Flex>
                    <Flex mr="16px">
                        <Button 
                            scale="sm"
                            disabled={pendingTx || !info || info.feeEnabled || !isAdmin}
                            onClick={() => handleToggleFee(true)}
                        >
                            { enablingFee ? (<Dots>{t('Enabling')}</Dots>) : t('Enable')}
                        </Button>
                    </Flex>
                    <Flex>
                        <Button 
                            scale="sm"
                            disabled={pendingTx || !info || !info.feeEnabled || !isAdmin}
                            onClick={() => handleToggleFee(false)}
                        >
                            { disablingFee ? (<Dots>{t('Disabling')}</Dots>) : t('Disable')}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
            
            <Flex flexDirection="column" mt="24px">
                <Text>{t('Exclude from Fee')}</Text>
                <StyledAddressInput
                    value={address} 
                    placeholder={t('Wallet Address')}
                    onUserInput={(value) => {
                        setAddress(value)
                        setAddressValid(true)
                    }} />
                {!isAddressValid && (
                    <Error>{t('Address is invalid')}</Error>
                )}
                <Flex mt='8px'>
                    <Flex mr="16px">
                        <Button scale="sm"
                            disabled={pendingTx || !info || !isAdmin}
                            onClick={handleExcludeFromFee}
                        >
                            { excludingFromFee ? (<Dots>{t('Excluding')}</Dots>) : t('Exclude')}
                        </Button>
                    </Flex>
                    <Flex>
                        <Button scale="sm"
                            disabled={pendingTx || !info || !isAdmin}
                            onClick={handleIncludeFromFee}
                        >
                            { includingFromFee ? (<Dots>{t('Including')}</Dots>) : t('Include')}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
            
            <Flex flexDirection="column" mt="24px">
                <Text>{t('Anti-Bot')}</Text>
                <Flex>
                    <Flex mr="16px">
                        <Button 
                            scale="sm"
                            disabled={pendingTx || !info || info.antiBotEnabled || !isAdmin}
                            onClick={() => handleToggleAntiBot(true)}
                        >
                            { enablingAntiBot ? (<Dots>{t('Enabling')}</Dots>) : t('Enable')}
                        </Button>
                    </Flex>
                    <Flex>
                        <Button 
                            scale="sm"
                            disabled={pendingTx || !info || !info.antiBotEnabled || !isAdmin}
                            onClick={() => handleToggleAntiBot(false)}
                        >
                            { disablingAntiBot ? (<Dots>{t('Disabling')}</Dots>) : t('Disable')}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Wrapper>
    )
}


export default MiniTokieAdmin