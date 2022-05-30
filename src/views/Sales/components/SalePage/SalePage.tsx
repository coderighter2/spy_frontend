import React, { useCallback, useEffect, useState } from 'react'
import { Link, RouteComponentProps, Router } from 'react-router-dom'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import { Breadcrumbs, Flex, Text, ChevronRightIcon, Spinner, LogoIcon, Heading, Button, useMatchBreakpoints, Skeleton } from '@pancakeswap/uikit'
import { LAUNCHPAD_BLACKLIST } from 'config/constants/launchpad'
import { PageBGWrapper } from 'components/StyledControls'
import { useTranslation } from 'contexts/Localization'
import useRefresh from 'hooks/useRefresh'
import { getSale, getSaleMeta } from '../../hooks/getSales'
import { PublicSaleData } from '../../types'
import SaleEditMetaSection from './SaleEditMetaSection'
import SalePageContent from './SalePageContent'

const StyledSection = styled(Flex)`
    filter: ${({ theme }) => theme.card.dropShadow};
    border-radius: ${({ theme }) => theme.radii.default};
    background: white;
    z-index: 1;
    padding: 16px;
    margin: 8px;
`
const SpinnerWrapper = styled(Flex)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`

const FullWidthFlex = styled(Flex)`
    width: 100%;
`
const BlankPage = styled.div`
    position:relative;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: calc(100vh - 540px);

    ${({ theme }) => theme.mediaQueries.sm} {
        padding-top: 32px;
        min-height: calc(100vh - 380px);
    }

    ${({ theme }) => theme.mediaQueries.md} {
        padding-top: 32px;
        min-height: calc(100vh - 336px);
    }
`
enum ViewMode {
    VIEW,
    EDITMETA
}

const SalePage: React.FC<RouteComponentProps<{address: string}>> = ({
    match: {
        params: {address: routeAddress}
    }
}) => {
    const { t } = useTranslation()
    const { account } = useWeb3React()
    const { slowRefresh }  = useRefresh()
    const [sale, setSale] = useState<PublicSaleData|null>(null)
    const [needReload, setNeedReload] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [isValid, setIsValid] = useState(true)
    const [viewMode, setViewMode] = useState(ViewMode.VIEW)

    const reloadSaleMeta = useCallback( async() => {
        const meta = await getSaleMeta(routeAddress)
        sale.meta = {...meta}
        sale.logo = meta.logo
        setSale(sale)
    }, [routeAddress, sale])

    useEffect(() => {
        const fetchSale = async() => {
            if (!isAddress(routeAddress)) {
                setIsValid(false)
                setLoaded(true)
                return
            }

            if (LAUNCHPAD_BLACKLIST.includes(routeAddress.toLowerCase())) {
                setIsValid(false)
                setLoaded(true)
                return
            }
            try {
                const sale_ = await getSale(routeAddress)
                if (!sale_) {
                    setIsValid(false)
                } else {
                    const meta = await getSaleMeta(routeAddress)
                    sale_.meta = {...meta}
                    sale_.logo = meta.logo
                    setIsValid(true)
                    setSale(sale_)
                }
            } catch (e) {
                console.log(e)
                setIsValid(false)
            }
            setLoaded(true)
            setNeedReload(false)
        }
            
        fetchSale()
        
    }, [routeAddress, needReload, slowRefresh])

    const triggerReload = () =>  {
        if (needReload) {
            setNeedReload(false)
            setNeedReload(true)
        } else {
            setNeedReload(true)
        }
    }

    const renderContent = () =>  {
        if (viewMode === ViewMode.VIEW) {
            return (
                <SalePageContent account={account} 
                    address={routeAddress} 
                    sale={sale} 
                    onEditMeta={() => setViewMode(ViewMode.EDITMETA)} 
                    onReloadSale={triggerReload} 
                    onWhitelistChanged={(enabled) => {
                        setSale({...sale, whitelistEnabled: enabled})
                    }}/>
            )
        }

        return <SaleEditMetaSection sale={sale} address={routeAddress} account={account} onBack={() => setViewMode(ViewMode.VIEW)} onUpdatedMeta={reloadSaleMeta}/>

    }
    
    return (
        <>
            <PageBGWrapper />

            { !loaded && (
                <Skeleton width="100%" height="500px" animation="waves"/>
            )}

            { loaded && !isValid && (
                <BlankPage>
                    <LogoIcon width="64px" mb="8px" />
                    <Heading scale="xxl">404</Heading>
                    <Text mb="16px">{t('Oops, page not found.')}</Text>
                    <Button as={Link} to="/" scale="sm">
                    {t('Back Home')}
                    </Button>
                </BlankPage>
            )}

            { loaded && isValid && renderContent()}
            
        </>
    )
}

export default SalePage