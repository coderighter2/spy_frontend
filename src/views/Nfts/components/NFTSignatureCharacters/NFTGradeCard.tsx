import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit';
import { NFTGradeConfig } from 'config/constants/nft/types'

const cardWrapper = styled.div`
`;

interface NFTGradeCardProps {
  resId: number
}

const NFTGradeCard: React.FC<NFTGradeCardProps> = ({ resId }) => {

  return (
    <Flex flexDirection="column" padding="12px">
      <img src={`/images/signatures/${resId}.jpg`} alt={`${resId}`}/>
    </Flex>
  )
}

export default NFTGradeCard
