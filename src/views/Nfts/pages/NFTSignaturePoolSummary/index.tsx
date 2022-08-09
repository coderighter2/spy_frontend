import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import Page from 'components/Layout/Page'
import FlexLayout from 'components/Layout/Flex'
import Container from 'components/Layout/Container'
import { useTranslation } from 'contexts/Localization'
import NFTSignaturePoolCard from '../../components/NFTSignaturePoolCard/NFTSignaturePoolCard'
import { Burn, getBurnsByQuery, SORT_DIRECTION, SORT_FILED } from '../../hooks/getBurns'
import BurnTable from './BurnTable'


const NFTSignaturePoolSummary: React.FC = () => {
    const pageSize = 10
    const { t } = useTranslation()
    const { account } = useWeb3React()
    const [page, setPage] = useState(1)
    const [sortField, setSortField] = useState(SORT_FILED.index)
    const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.desc)
    const [totalAmount, setTotalAmount] = useState<BigNumber|undefined>(undefined)
    const [maxPage, setMaxPage] = useState(1)
    const [burns, setBurns] = useState<Burn[]>([])
    const [loading, setLoading] = useState(0)

    useEffect(() => {

        const fetchBurns = async () => {
            setLoading((current) => {
                return current + 1;
            })
            const data = await getBurnsByQuery(page - 1, pageSize,sortField,sortDirection)
            if (data.page === page-1) {
                setBurns(data.burns)
            }
            setMaxPage(Math.ceil(data.count / pageSize));
            setTotalAmount(data.total)
            setLoading((current) => {
                return current - 1;
            })
        }
        fetchBurns()

    }, [page,sortField,sortDirection])


    const handleSort = useCallback(
        (newField: string) => {
          setSortField(newField)
          setSortDirection(sortField !== newField || sortDirection === SORT_DIRECTION.asc ? SORT_DIRECTION.desc : SORT_DIRECTION.asc)
        },
        [sortDirection, sortField],
    )
    

    return (
        <Page>
            <FlexLayout>
                <NFTSignaturePoolCard account={account} />
            </FlexLayout>
            <Container>
                <Flex justifyContent="space-between" padding="16px">
                    <Heading scale="md" style={{textShadow:"2px 3px rgba(255,255,255,0.2)"}}>
                    {t('SPY Burning')}
                    </Heading>
                    <Flex alignItems="center">
                        <Text mr="8px">
                            {t('Total Burns: ')}
                        </Text>
                        {totalAmount ? (
                            <Text>
                                {totalAmount.toNumber()} SPY
                            </Text>
                        ) : (
                            <Skeleton width="100px" height="20px"/>
                        )}
                    </Flex>
                </Flex>
                
                <BurnTable 
                    loading={loading > 0}
                    rows={burns} 
                    page={page} 
                    pageSize={pageSize} 
                    sortField={sortField}
                    sortDirection={sortDirection}
                    maxPage={maxPage} 
                    setPage={(page_) => setPage(page_)}
                    handleSort = {(field_) => handleSort(field_)}
                />
            </Container>
        </Page>
    )
}

export default NFTSignaturePoolSummary