import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Text, Progress, Flex, LinkExternal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { getBscScanLink } from 'utils'
import truncateHash from 'utils/truncateHash'
import { VoteData } from '../../types'

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    margin: 8px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;

    ${({ theme }) => theme.mediaQueries.sm} {
        margin: 12px;
        padding: 24px;
    }
`

const Row = styled(Flex).attrs({justifyContent:"space-between", alignItems:"center"})`
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
    padding: 4px 0px;
    min-height: 40px;
`

const AddressLink = styled(LinkExternal)`
    font-size: 14px;
`

interface VotesGroupProps {
    totalWeight?: BigNumber
    percent: number
    voteAddressCount?: number
    votes?: VoteData[]
    isFor?: boolean
}

const VotesGroup: React.FC<VotesGroupProps> = ({totalWeight, voteAddressCount, votes, isFor, percent}) => {

    const { t } = useTranslation()

    const placeHolders = useMemo(() => {
        if (!votes) {
            return ['0', '1', '2', '3']
        }

        if (votes.length < 4) {
            const res: string[] = []
            for (let i = 0; i < 4 - votes.length; i ++ ) {
                res.push(i.toString())
            }
            return res
        }
        return []
    }, [votes])

    return (
        <Wrapper>
            <Flex flexDirection="column" mb="8px">
                <Flex justifyContent="space-between">
                    <Text fontSize="14px">
                        {isFor? t('Vote For') : t('Vote Against')}
                    </Text>
                    <Text fontSize="14px">
                        {totalWeight? totalWeight.toString() : '0'}
                    </Text>
                </Flex>
                <Flex flexDirection="column">
                    <Progress
                        variant="round"
                        scale="sm"
                        primaryStep={percent}
                        useDark
                    />
                </Flex>
            </Flex>

            <Flex flexDirection="column">
                <Row>
                    <Text color="primary" fontSize="14px">
                        {t("%count% Addresses", {count: voteAddressCount ?? 0})}
                    </Text>

                    <Text color="primary" fontSize="14px">
                        {t("Vote")}
                    </Text>
                </Row>
                <Flex flexDirection="column">
                    { votes && votes.map((vote) => {
                        return (
                            <Row key={vote.id}>
                                <AddressLink href={getBscScanLink(vote.voter, 'address')}>{truncateHash(vote.voter)}</AddressLink>
                                <Text fontSize="14px">
                                    {vote.weight.toString()}
                                </Text>
                            </Row>
                        )
                    })}
                    { placeHolders.length > 0 && placeHolders.map((item) => {
                        return (
                            <Row key={item}>
                                <Text fontSize="14px">
                                    -
                                </Text>
                                <Text fontSize="14px">
                                    -
                                </Text>
                            </Row>
                        )
                    })}
                </Flex>
            </Flex>

        </Wrapper>
    )
}


export default VotesGroup