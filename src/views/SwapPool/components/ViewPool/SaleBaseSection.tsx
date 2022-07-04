import React, { useMemo } from 'react'
import { useTranslation } from 'contexts/Localization'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Flex, Heading, IconButton, useMatchBreakpoints, Skeleton } from '@pancakeswap/uikit'
import TokenAddress from 'components/TokenAddress'
import { BIG_TEN } from 'utils/bigNumber'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { useToken } from 'hooks/Tokens'
import useTotalSupply from 'hooks/useTotalSupply'
import { InfoRow, InfoLabel, InfoValue } from './styled'
import { PublicSaleData } from '../../types'

const LogoWrapper = styled.div`
    width: 80px;
    height: 80px;
    margin-right: 16px;
    > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
`

const StyledIconButton = styled(IconButton)`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    background: ${({ theme }) => theme.colors.backgroundAlt2};
    border-radius: 12px;
    margin-right: 8px;
`

export interface SaleBaseSectionProps {
    account?: string
    sale: PublicSaleData
}

const SaleBaseSection: React.FC<SaleBaseSectionProps> = ({account, sale}) => {

    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const token = useToken(sale.token)
    const baseToken = useToken(sale.baseToken)
    const totalSupply = useTotalSupply(token)

    const baseTokenSymbol = useMemo(() => {
        return baseToken.symbol
    }, [baseToken])

    const baseTokenDecimals = useMemo(() => {
        if (baseToken) {
            return baseToken.decimals
        }

        return -1
    }, [baseToken])

    return (
        <>
            <Flex flexDirection="column" width="100%">
                <Flex justifyContent="space-between">
                    <Flex alignItems="center">
                        <LogoWrapper>
                            { sale.logo && sale.logo.length > 0 ? (
                                <img src={sale.logo} alt={t('Logo')} />
                            ) : (
                                <img src='/logo.png' alt={t('SPY Logo')} />
                            )}
                        </LogoWrapper>
                        <Flex flexDirection="column">
                            <Flex alignItems="center">
                            <Heading>
                                {sale.name}
                            </Heading>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
                
                <Flex flexDirection="column">
                    <InfoRow>
                        <InfoLabel>{t('Swap Pool Address')}</InfoLabel>
                        <Flex alignItems="center">
                            <TokenAddress truncate={isMobile} scale="sm" address={sale.address}/>
                        </Flex>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Token Name')}</InfoLabel>
                        { token ? (
                            <InfoValue>{token.name}</InfoValue>
                        ) : (
                            <Skeleton width="60px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Token Symobl')}</InfoLabel>
                        { token ? (
                            <InfoValue>{token.symbol}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Token Decimals')}</InfoLabel>
                        { token ? (
                            <InfoValue>{token.decimals}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Token Address')}</InfoLabel>
                            <TokenAddress truncate={isMobile} scale="sm" address={sale.token}/>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Total Supply')}</InfoLabel>
                        { totalSupply ? (
                            <InfoValue>{totalSupply.toExact()} {token.symbol}</InfoValue>
                        ) : (
                            <Skeleton width="60px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Swap Rate')}</InfoLabel>
                        { token && baseTokenDecimals >= 0? (
                            <InfoValue>1 {baseTokenSymbol} = {getFullDisplayBalance(sale.rate.multipliedBy(BIG_TEN.pow(baseTokenDecimals - sale.rateDecimals)), token.decimals)} {token ? token.symbol : ''}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Soft Cap')}</InfoLabel>
                        { baseTokenDecimals >= 0 ? (
                            <InfoValue>{getFullDisplayBalance(sale.goal, baseTokenDecimals)} {baseTokenSymbol}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Hard Cap')}</InfoLabel>
                        { baseTokenDecimals >= 0 ? (
                            <InfoValue>{getFullDisplayBalance(sale.cap, baseTokenDecimals)} {baseTokenSymbol}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Swap Start Time')}</InfoLabel>
                        <InfoValue>{ format(sale.openingTime * 1000, 'yyyy/MM/dd hh:mm aa')}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Swap End Time')}</InfoLabel>
                        <InfoValue>{ format(sale.closingTime * 1000, 'yyyy/MM/dd hh:mm aa')}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Vesting')}</InfoLabel>
                        { sale.vestingEnabled ? (
                            <InfoValue>{t('%percent%% per %interval% hours',{percent: sale.vestingPercent, interval: sale.vestingInterval / 3600})}</InfoValue>
                        ) : (
                            <InfoValue>{t('Disabled')}</InfoValue>
                        )}
                        
                    </InfoRow>
                </Flex>
            </Flex>
        </>
    )
}

export default SaleBaseSection