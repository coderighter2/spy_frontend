import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowBackIcon, ArrowForwardIcon, Box, Flex, Skeleton, Text, useMatchBreakpoints, LinkExternal } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { format } from 'date-fns'
import truncateHash from 'utils/truncateHash'
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import { Burn, SORT_DIRECTION, SORT_FILED } from '../../hooks/getBurns'


const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  padding: 0 24px;

  grid-template-columns: 20px 2fr 2fr repeat(2, 1fr);

  @media screen and (max-width: 670px) {
    grid-template-columns: 1fr 1fr;
    > *:first-child {
      display: none;
    }
    > *:nth-child(3) {
      display: none;
    }
  }
`
export const ClickableColumnHeader = styled(Text)`
  cursor: pointer;
`

export const TableWrapper = styled(Flex)`
  width: 100%;
  padding-top: 16px;
  flex-direction: column;
  gap: 16px;
  background-color: ${({ theme }) => theme.card.background};
  border-radius: ${({ theme }) => theme.radii.card};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

export const Break = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  width: 100%;
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2em;
  margin-bottom: 1.2em;
`
export const Arrow = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  padding: 0 20px;
  :hover {
    cursor: pointer;
  }
`

const TableLoader: React.FC<{count: number}> = ({count}) => {
    const loadingRow = (
        <ResponsiveGrid>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
            <Skeleton/>
        </ResponsiveGrid>
    )
    return (
      <>
        { [...Array(count)].map((elementInArray, index) => (
            <>
            {loadingRow}
            </>
        ))}
      </>
    )
}


const DataRow: React.FC<{ 
    burnData: Burn
    index: number
}> = ({ burnData, index }) => {
    const { isXs, isSm } = useMatchBreakpoints()
    const { t } = useTranslation()
    return (
        <ResponsiveGrid>
            <Flex>
                <Text>{index + 1}</Text>
            </Flex>
            <Flex alignItems="center">
                <LinkExternal href={getBscScanLink(burnData.txid, 'transaction')}>{truncateHash(burnData.txid)}</LinkExternal>
            </Flex>
            <Text fontWeight={400}>{format(new Date(burnData.timestamp * 1000), 'MMM. dd yyyy, hh:mm aa')}</Text>
            <Flex alignItems="center">

                <LinkExternal href={getBscScanLink(burnData.from, 'address')}>{truncateHash(burnData.from)}</LinkExternal>
            </Flex>
            <Text fontWeight={400}>{burnData.amount.toNumber()}</Text>
        </ResponsiveGrid>
    )
}

const BurnTable: React.FC<{
    rows: Burn[],
    page: number,
    pageSize: number,
    maxPage: number,
    loading: boolean,
    sortField: string,
    sortDirection: string,
    setPage: (page: number) => void
    handleSort: (newField: string) => void
}> = ({
    loading, 
    rows, 
    page, 
    pageSize, 
    maxPage, 
    sortField, 
    sortDirection, 
    setPage, handleSort
}) => {

    const { t } = useTranslation()
    return (
        <TableWrapper>
            <ResponsiveGrid>
                <Text
                    color="secondary"
                    fontSize="12px"
                    bold
                    >
                    #
                </Text>
                <Text
                    color="secondary"
                    fontSize="12px"
                    bold
                    textTransform="uppercase"
                >
                    {t('Transaction')}
                </Text>
                <ClickableColumnHeader
                    color="secondary"
                    fontSize="12px"
                    bold
                    textTransform="uppercase"
                    onClick={() => handleSort(SORT_FILED.timestamp)}
                >
                    {t('Date/Time')}
                </ClickableColumnHeader>
                <Text
                    color="secondary"
                    fontSize="12px"
                    bold
                    textTransform="uppercase"
                >
                    {t('From')}
                </Text>
                <Text
                    color="secondary"
                    fontSize="12px"
                    bold
                    textTransform="uppercase"
                >
                    {t('Burned Amount')}
                </Text>
            </ResponsiveGrid>
            <Break />
            { rows.length > 0 && !loading ? (
                <>
                    {rows.map((row, i) => {
                        return (
                            <React.Fragment key={row.id}>
                              <DataRow index={(page - 1) * pageSize + i} burnData={row} />
                              <Break />
                            </React.Fragment>
                        )
                    })}
                    <PageButtons>
                      <Arrow
                        onClick={() => {
                          setPage(page === 1 ? page : page - 1)
                        }}
                      >
                        <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
                      </Arrow>
                      <Text>{t('Page %page% of %maxPage%', { page, maxPage })}</Text>
                      <Arrow
                        onClick={() => {
                          setPage(page === maxPage ? page : page + 1)
                        }}
                      >
                        <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
                      </Arrow>
                    </PageButtons>
                </>
            ) : (
                <>
                <TableLoader count={pageSize}/>
                <Box/>
                </>
            )}
        </TableWrapper>
    )
}

export default BurnTable