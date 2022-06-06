import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Heading, Text, Button, Flex, Box, Skeleton } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import Page, { PageMeta } from 'components/Layout/Page'
import useRefresh from 'hooks/useRefresh'
import NotFound from 'views/NotFound'
import { useTranslation } from 'contexts/Localization'
import { useGetMiniTokieInfo, MiniTokieInfo } from './hooks/getTokie'
import MiniTokieDetail from './components/MiniTokieDetail'
import MiniTokieAdmin from './components/MiniTokieAdmin'


const HeaderOuter = styled(Box)<{ background?: string }>`
  background: ${({ theme, background }) => background || theme.colors.gradients.bubblegum};
`

const HeaderInner = styled(Container)`
  padding-top: 32px;
`

const Wrapper = styled(Flex).attrs({flexDirection:"column"})`
    padding: 24px 0px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background: white;
`

const MiniTokie: React.FC = () => {

    const { t } = useTranslation()

    const { onGetInfo } = useGetMiniTokieInfo()
    const [info, setInfo] = useState<MiniTokieInfo>(null)
    const [loading, setLoading] = useState(false)
    const { slowRefresh, fastRefresh } = useRefresh()

    useEffect(() => {
        const loadInfo = async () => {
            try {
                setLoading(true)
                const info_ = await onGetInfo()
                console.log(info_)
                setInfo(info_)
            } finally {
                setLoading(false)
            }
        }
        loadInfo()
    }, [fastRefresh, onGetInfo])

    return (
        <>
        <HeaderOuter>
            <HeaderInner>
                <Flex flexDirection="column">
                    <Flex justifyContent="space-between">
                        <Heading scale="xl" color="secondary" mb="12px">
                            {t('Mini Tokie Dashboard')}
                        </Heading>
                    </Flex>
                </Flex>
            </HeaderInner>
        </HeaderOuter>

        <Page>

            <Flex flexDirection={["column", null, null, "row"]}>
                <Flex flex="1" flexDirection="column" mr={[null, null, null, "12px"]}>
                    <MiniTokieDetail info={info}/>
                </Flex>
                <Flex flex="1" flexDirection="column" mr={[null, null, null, "12px"]}>
                    <MiniTokieAdmin info={info}/>
                </Flex>
            </Flex>
        </Page>
        </>
    )
}
export default MiniTokie