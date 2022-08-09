import React from 'react'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import tokens from 'config/constants/tokens'
import Page from 'components/Layout/Page'
import { Flex } from '@pancakeswap/uikit'
import { usePollNFTSignaturePublicData } from 'state/nft/hooks'
import CastNFTSignature from './components/CastNFTSignature'
import MyNFTs from './components/MyNFTs/MyNFTs'
import NFTSignatureCharacters from './components/NFTSignatureCharacters'

const Signatures: React.FC = () => {
    const { path } = useRouteMatch()
    const { account } = useWeb3React()
    usePollNFTSignaturePublicData()

    return (
        <>
            <Page>
                <Flex flexWrap="wrap" alignItems="stretch">
                    <NFTSignatureCharacters/>
                    <CastNFTSignature account={account} />
                    <MyNFTs account={account} nftAddress={tokens.signature.address}/>
                </Flex>
            </Page>
        </>
    )
}

export default Signatures