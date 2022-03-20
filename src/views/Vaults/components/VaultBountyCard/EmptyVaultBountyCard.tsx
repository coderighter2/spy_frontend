import React from 'react'
import styled from 'styled-components'
import {Flex, Text, Button, useTooltip, HelpIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const StyledCard = styled.div`
    width: 100%;
    max-width: 280px;
    margin: 4px 0px 16px;
    padding: 16px;
    border-radius: 24px;
    border: 1px solid rgba(0,0,0,0.1);
    border-color: ${({ theme }) => 'rgba(0,0,0,0.1)'};
    background: ${({ theme }) => theme.colors.backgroundAlt};
`

const EmptyVaultBountyCard: React.FC = () => {
    
    const { t } = useTranslation()

    const { targetRef, tooltip, tooltipVisible } = useTooltip(
        t('It is a reward for who ever gets to first auto-compound for the vault by clicking on claim! Only the first person who claim it on time can receive it!'),
        { },
    )

    return (
        <StyledCard>
            <Flex justifyContent="space-between">
                <Flex flexDirection="column" mr="16px">
                    <Flex alignItems="center">
                        <Text color="secondary" mr="4px">{t('SPY Bounty')}</Text>
                        <span ref={targetRef}>
                            <HelpIcon width="16px" height="16px" color="textSubtle" />
                        </span>
                        {tooltipVisible && tooltip}
                    </Flex>
                    <Text color="primary">0.000</Text>
                    <Text>~$0.00</Text>
                </Flex>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                    <Button scale="sm" disabled>
                        {t('Claim')}
                    </Button>
                    <Text>
                        --:--:--
                    </Text>
                </Flex>
            </Flex>
        </StyledCard>
    )
}

export default EmptyVaultBountyCard
