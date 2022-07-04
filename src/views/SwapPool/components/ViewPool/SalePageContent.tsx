import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Breadcrumbs, Flex, Text, ChevronRightIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import truncateHash from 'utils/truncateHash'
import SaleBaseSection from './SaleBaseSection'
import SaleActionSection from './SaleActionSection'
import SaleStatusSection from './SaleStatusSection'
import { PublicSaleData } from '../../types'
import SaleManageSection from './SaleManageSection'
import SaleWhitelistSection from './SaleWhitelistSection'

const StyledSection = styled(Flex)`
    filter: ${({ theme }) => theme.card.dropShadow};
    border-radius: ${({ theme }) => theme.radii.default};
    background: white;
    z-index: 1;
    padding: 16px;
    margin: 8px;
`
export interface SalePageContentProps {
    account?: string
    address: string
    sale?: PublicSaleData
    onEditMeta?: () => void
    onReloadSale?: () => void
    onWhitelistChanged?: (enabled: boolean) => void
}

const SalePageContent: React.FC<SalePageContentProps> = ({
    account, address, sale, onEditMeta, onReloadSale, onWhitelistChanged
}) => {
    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    
    return (
        <>
            <Flex style={{padding: "24px 16px 12px 16px"}}>
                <Breadcrumbs mb="32px" separator={<ChevronRightIcon color="white" width="24px" />}>
                <Link to="/swap-pools">
                    <Text color="white">{t('Swap Pools')}</Text>
                </Link>
                <Flex>
                    <Text mr="8px" color="rgba(255, 255, 255, 0.6)">{ isMobile ? truncateHash(address) : address}</Text>
                </Flex>
                </Breadcrumbs>
            </Flex>
            { sale && (
                <Flex flexDirection="row" flexWrap="wrap" style={{padding: "0px 8px 32px 0px"}}>
                    <Flex flexDirection="column" flex={[1, 1, 1, 3]} width={['100%', '100%', '66%', '66%']}>
                        <StyledSection>
                            <SaleBaseSection sale={sale} account={account}/>
                        </StyledSection>
                    </Flex>
                    <Flex flexDirection="column" flex={[1, 1, 1, 2]} width={['100%', '100%', '33%', '33%']}>
                        { account === sale.owner ? (
                            <>
                            <StyledSection>
                                <SaleManageSection sale={sale} account={account} onReloadSale={onReloadSale}/>
                            </StyledSection>
                            { !sale.canceled && !sale.finalized && (
                                <StyledSection>
                                    <SaleWhitelistSection sale={sale} account={account} onReloadSale={onReloadSale}/>
                                </StyledSection>
                            )}
                            </>
                        ) : (
                            <StyledSection>
                                <SaleActionSection sale={sale} account={account} onReloadSale={onReloadSale}/>
                            </StyledSection>
                        )}
                        <StyledSection>
                            <SaleStatusSection sale={sale}/>
                        </StyledSection>
                    </Flex>
                </Flex>
            )}
        </>
    )
}

export default SalePageContent