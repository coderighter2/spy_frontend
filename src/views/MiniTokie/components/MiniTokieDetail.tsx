import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, LinkExternal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import tokens from 'config/constants/tokens'
import truncateHash from 'utils/truncateHash'
import { getBscScanLink } from 'utils'
import { getFullDisplayBalance } from 'utils/formatBalance'
import useTheme from 'hooks/useTheme'
import { MiniTokieInfo } from '../hooks/getTokie'

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
    border-top: 1px solid rgba(0,0,0,0.3);
    padding: 4px 0px;
`

const Label = styled(Text)`
    font-size: 13px;
`

const Value = styled(Text)`
    font-size: 13px;
`

const ValueLink = styled(LinkExternal)`
    font-size: 13px;
`

interface MiniTokieDetailProps {
    info?: MiniTokieInfo
}

const MiniTokieDetail: React.FC<MiniTokieDetailProps> = ({ info}) => {

    const { t } = useTranslation()
    const { theme } = useTheme()

    return (
        <Wrapper>
            <Flex flexDirection="column">
                <Heading paddingY="12px">
                    {t('Detail')}
                </Heading>
            </Flex>
            
            <Flex flexDirection="column">
                <Row>
                    <Label>
                        {t('Fee Enabled')}
                    </Label>
                    { info && (
                        <Value>
                            {info.feeEnabled ? t('Enabled') : t('Disabled')}
                        </Value>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Liquidity Fee')}
                    </Label>
                    <Value>
                        {info && info.liquidityFee} %
                    </Value>
                </Row>
                <Row>
                    <Label>
                        {t('Buyback SPY')}
                    </Label>
                    <Value>
                        {info && info.buybackFee} %
                    </Value>
                </Row>
                <Row>
                    <Label>
                        {t('Auto Burn')}
                    </Label>
                    <Value>
                        {info && info.burnFee} %
                    </Value>
                </Row>
                <Row>
                    <Label>
                        {t('Marketing')}
                    </Label>
                    <Value>
                        {info && info.marketingFee} %
                    </Value>
                </Row>
                <Row>
                    <Label>
                        {t('Fee Threshold')}
                    </Label>
                    { info && (
                        <Value>
                            {getFullDisplayBalance(info.numTokensSellToAddToLiquidity, tokens.minitokie.decimals)} {tokens.minitokie.symbol}
                        </Value>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Liquidity Fee')}
                    </Label>
                    { info && (
                        <Value>
                            {getFullDisplayBalance(info.liquidityFeeTotal, tokens.minitokie.decimals)} {tokens.minitokie.symbol}
                        </Value>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Buyback SPY Fee')}
                    </Label>
                    { info && (
                        <Value>
                            {getFullDisplayBalance(info.liquidityFeeTotal, tokens.minitokie.decimals)} {tokens.minitokie.symbol}
                        </Value>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Owner')}
                    </Label>
                    {info && (
                        <ValueLink href={getBscScanLink(info.owner, 'address')}>{truncateHash(info.owner)}</ValueLink>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Marketking Wallet')}
                    </Label>
                    {info && (
                        <ValueLink href={getBscScanLink(info.marketingWallet, 'address')}>{truncateHash(info.marketingWallet)}</ValueLink>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Buyback Wallet')}
                    </Label>
                    {info && (
                        <ValueLink href={getBscScanLink(info.buybackWallet, 'address')}>{truncateHash(info.buybackWallet)}</ValueLink>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('BNB Pair')}
                    </Label>
                    {info && (
                        <ValueLink href={getBscScanLink(info.uniswapV2Pair, 'token')}>{truncateHash(info.uniswapV2Pair)}</ValueLink>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Anti-Bot')}
                    </Label>
                    { info && (
                        <Value>
                            {info.antiBotEnabled ? t('Enabled') : t('Disabled')}
                        </Value>
                    )}
                </Row>
                <Row>
                    <Label>
                        {t('Anti-Bot Contract')}
                    </Label>
                    {info && (
                        <ValueLink href={getBscScanLink(info.antiBot, 'address')}>{truncateHash(info.antiBot)}</ValueLink>
                    )}
                </Row>
            </Flex>
        </Wrapper>
    )
}


export default MiniTokieDetail