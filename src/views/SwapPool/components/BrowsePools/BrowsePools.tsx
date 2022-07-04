import React, {useEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import { Box, Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import { SALE_FINALIZE_DEADLINE } from 'config/constants'
import { useTranslation } from 'contexts/Localization'
import FlexLayout from 'components/Layout/Flex'
import Select from 'components/Select/Select'
import { useAppDispatch } from 'state'
import useENS from 'hooks/ENS/useENS'
import { useTotalSaleCount } from 'state/swapPool/hooks'
import PoolCard from './PoolCard'
import { getSales } from '../../hooks/getSales'
import { PublicSaleData } from '../../types'


export interface PageData {
    totalCount: number
    page: number
    data?: PublicSaleData[]
}

const BrowsePools: React.FC = () => {

    const theme = useTheme()
    const { t } = useTranslation()
    const itemPerPage = 100;
    const { account } = useWeb3React()
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(true)
    const [pageData, setPageData] = useState<PageData>({
        totalCount: 0,
        page: 0,
        data: null
    })
    const totalSaleCount = useTotalSaleCount()

    
    useEffect(() => {

        const fetchSales = async() =>  {
            try {
                setIsLoading(true)
                if (totalSaleCount > 0) {
                    const data = await getSales(0, Math.min(itemPerPage, totalSaleCount))
                    setPageData({data:data.reverse(), page: 0, totalCount: totalSaleCount})
                } else {
                    setPageData({data: undefined, page: 0, totalCount: 0})
                }
            } catch (e) {
                console.log('e', e)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSales()

    }, [dispatch, account, totalSaleCount, pageData.page, itemPerPage])

    const filteredArray = useMemo(() => {
        return pageData.data
    }, [pageData])

    const renderContent = () => {
        if (isLoading) {
            return (
                <Skeleton width="100%" height="300px" animation="waves"/>
            )
        }

        return (
            <FlexLayout>
            {
                filteredArray ? filteredArray.map((sale) => (
                    <PoolCard 
                        key={sale.address}
                        sale={sale}
                    />
                )) 
                : null
            }
            </FlexLayout>
        )
    }

    return (
        <>
            <Flex flexDirection="column" margin={["12px", "12px", "12px", "24px"]}>
            <Flex flexDirection="column" alignItems="center">
                {totalSaleCount >= 0 ? (
                    <Heading color='primary' scale="xl" textAlign="center">
                        {totalSaleCount}
                    </Heading>
                ): (
                    <Skeleton width="100px" height="40px"/>
                )}
                
                <Text color='secondary' textAlign="center">
                    {t('Swap Pools Created')}
                </Text>
            </Flex>

            {renderContent()}

            </Flex>
        </>
    )
}

export default BrowsePools