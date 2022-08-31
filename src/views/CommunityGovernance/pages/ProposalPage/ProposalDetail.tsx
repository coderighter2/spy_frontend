import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import styled from 'styled-components'
import { Text, Flex, Heading } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import ReactMarkdown from 'components/ReactMarkdown'
import useTheme from 'hooks/useTheme'
import { useBlock } from 'state/block/hooks'
import { Proposal, ProposalData, ProposalState } from '../../types'

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

interface ProposalHeaderProps {
    body: string
}

const ProposalDetail: React.FC<ProposalHeaderProps> = ({ body}) => {

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
                <ReactMarkdown>
                    {body}
                </ReactMarkdown>
            </Flex>
        </Wrapper>
    )
}


export default ProposalDetail