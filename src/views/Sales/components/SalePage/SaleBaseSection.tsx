import React, { useMemo } from 'react'
import { Facebook, GitHub, Globe, Instagram, Send, Twitter } from 'react-feather'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Flex, Text, Button, Heading, TwitterIcon, IconButton, GithubIcon, TelegramIcon, LanguageIcon, LinkExternal, useMatchBreakpoints, Skeleton, PencilIcon, RedditIcon, InstagramIcon, useTooltip, HelpIcon } from '@pancakeswap/uikit'
import TokenAddress from 'components/TokenAddress'
import { getBscScanLink } from 'utils'
import { BIG_TEN } from 'utils/bigNumber'
import truncateHash from 'utils/truncateHash'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { LinkWrapper } from 'components/StyledControls'
import { useToken } from 'hooks/Tokens'
import useTotalSupply from 'hooks/useTotalSupply'
import { InfoRow, InfoLabel, InfoValue } from './styled'
import { PublicSaleData, SaleContractVersion } from '../../types'

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
    onEditMeta?: () => void
}

const SaleBaseSection: React.FC<SaleBaseSectionProps> = ({account, sale, onEditMeta}) => {

    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const token = useToken(sale.token)
    const baseToken = useToken(sale.useETH ? undefined : sale.baseToken)
    const totalSupply = useTotalSupply(token)
    const {
        targetRef: airdropTooltipTargetRef,
        tooltip: airdropTooltipElement,
        tooltipVisible: airdropTooltipVisible,
      } = useTooltip(
      <>
      <ul>
      <li>If enabled and vesting is disabled, tokens will be airdropped to the investors once the owner finalize this presale.</li>
      <li>Also refunds will be airdropped if the owner cancel this presale.</li>
      <li>Otherwise, if disabled, the investors need to claim tokens/refunds after the presale is closed</li>
      </ul>
      </>, {
        placement: 'bottom',
      })

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
                            { account === sale.owner && (
                            <IconButton onClick={onEditMeta} variant="text" scale="sm">
                                <PencilIcon width="16px" height="16px"/>
                            </IconButton>
                            )}
                            </Flex>
                            <Flex flexDirection="row">
                                { sale.meta && sale.meta.website && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.website} target="_blank">
                                    {/* <LanguageIcon width="16px" color="primary" /> */}
                                    <Globe width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.facebook && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.facebook} target="_blank">
                                        {/* <FacebookIcon width="16px" color="primary" /> */}
                                        <Facebook width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.twitter && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.twitter} target="_blank">
                                        <Twitter width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.instagram && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.instagram} target="_blank">
                                        <Instagram width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.telegram && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.telegram} target="_blank">
                                        <Send width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.github && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.github} target="_blank">
                                        <GitHub width="16px"/>
                                    </LinkWrapper>
                                )}
                                { sale.meta && sale.meta.reddit && (
                                    <LinkWrapper style={{marginRight: "16px"}} as="a" href={sale.meta.reddit} target="_blank">
                                        <RedditIcon width="16px" color="primary" />
                                    </LinkWrapper>
                                )}
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
                {sale.meta && sale.meta.description && sale.meta.description.length > 0 && (
                    <Text fontSize="14px" color="rgba(0,0,0,0.7)" mt="8px" mb="8px">
                        {sale.meta.description}
                    </Text>
                )}
                
                <Flex flexDirection="column">
                    <InfoRow>
                        <InfoLabel>{t('Presale Address')}</InfoLabel>
                        <Flex alignItems="center">
                            <TokenAddress truncate={isMobile} scale="sm" address={sale.address}/>
                        </Flex>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Presale Owner')}</InfoLabel>
                        <Flex alignItems="center">
                            <TokenAddress truncate={isMobile} scale="sm" address={sale.owner}/>
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
                        <InfoLabel>{t('Presale Rate')}</InfoLabel>
                        { token && baseTokenDecimals >= 0? (
                            <InfoValue>1 {baseTokenSymbol} = {getFullDisplayBalance(sale.rate.multipliedBy(BIG_TEN.pow(baseTokenDecimals - sale.rateDecimals)), token.decimals)} {token ? token.symbol : ''}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Listing Rate')}</InfoLabel>
                        { token && baseTokenDecimals >= 0 ? (
                            <InfoValue>1 {baseTokenSymbol} = {getFullDisplayBalance(sale.listingRate.multipliedBy(BIG_TEN.pow(baseTokenDecimals - sale.listingRateDecimals)), token.decimals)} {token ? token.symbol : ''}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Liquidity')}</InfoLabel>
                        <InfoValue>{sale.liquidity} %</InfoValue>
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
                        <InfoLabel>{t('Free Airdrop')}</InfoLabel>
                        { token ? (
                            <InfoValue>{getFullDisplayBalance(sale.airdropAmount, token.decimals)} {token.symbol}</InfoValue>
                        ) : (
                            <Skeleton width="40px" height="30px"/>
                        )}
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Presale Start Time')}</InfoLabel>
                        <InfoValue>{ format(sale.openingTime * 1000, 'yyyy/MM/dd hh:mm aa')}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>{t('Presale End Time')}</InfoLabel>
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
                    <InfoRow>
                        <InfoLabel>{t('Airdrop Tokens')}</InfoLabel>
                        <Flex alignItems="center">
                            <InfoValue>{sale.airdropEnabled ? 'Enabled' : 'Disabled'}</InfoValue>
                            <span ref={airdropTooltipTargetRef}>
                                <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
                            </span>
                            { airdropTooltipVisible && airdropTooltipElement}
                        </Flex>
                    </InfoRow> 
                </Flex>
            </Flex>
        </>
    )
}

export default SaleBaseSection