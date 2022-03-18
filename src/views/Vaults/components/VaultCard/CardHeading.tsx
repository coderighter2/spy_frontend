import React from 'react'
import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { CompoundingPoolTag } from 'components/Tags'
import { TokenPairImage } from 'components/TokenImage'
import tokens from 'config/constants/tokens'

export interface ExpandableSectionProps {
  symbol?: string
  token: Token
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const CardHeading: React.FC<ExpandableSectionProps> = ({ symbol, token }) => {
  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={tokens.spy} width={64} height={64} />
      <Flex flexDirection="column" alignItems="flex-end">
        <Heading mb="4px">{symbol}</Heading>
        <Flex justifyContent="center">
          <CompoundingPoolTag />
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
