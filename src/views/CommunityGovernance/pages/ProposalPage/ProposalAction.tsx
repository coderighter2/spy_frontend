import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { Text, Flex, Button } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import Dots from 'components/Loader/Dots'
import { BSC_BLOCK_TIME } from 'config'
import useToast from 'hooks/useToast'
import { useBlock } from 'state/block/hooks'
import { Proposal, ProposalState, VoteType } from '../../types'
import useVoteProposal, { useVoteWeight } from '../../hooks/useVoteProposal'

const Wrapper = styled(Flex).attrs({flexDirection:"row"})`
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

interface ProposalActionProps {
    proposal?: Proposal
    proposalId: string
}

const ProposalAction: React.FC<ProposalActionProps> = ({proposalId, proposal}) => {

    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const [pendingTx, setPendingTx] = useState(false)
    const [hasVoted, onVote] = useVoteProposal(proposalId)
    const [gettingWeight, hasCalculatedWeight, votingPower, onCalculate] = useVoteWeight(proposalId)

    const isActive = useMemo(() => {
        return proposal && proposal.state === ProposalState.Active
    }, [proposal])

    const handleCalculate = useCallback(async () => {
        try {
            setPendingTx(true)
            await onCalculate()
            toastSuccess(t('Success'), t('You can vote on the proposal now!'))
        } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setPendingTx(false)
        }
    }, [onCalculate, t, toastError, toastSuccess])

    const handleVote = useCallback(async (vote: number) => {
        try {
            setPendingTx(true)
            await onVote(vote)
            toastSuccess(t('Success'), t('You have voted on the proposal successfully.'))
        } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setPendingTx(false)
        }
    }, [onVote, t, toastError, toastSuccess])

    if (!proposal || proposal.state === ProposalState.Pending) {
        <Wrapper>
            <Flex flexDirection="column">
                <Flex justifyContent="center" mb="12px">
                    <Text mr="12px">{t('Not started yet')}</Text>
                </Flex>
            </Flex>
        </Wrapper>
    }

    return (
        <Wrapper>
            <Flex flexDirection="column">
                {hasCalculatedWeight ? (
                <Flex justifyContent="center" mb="12px">
                    <Text mr="12px">{t('Your Voting Power:')}</Text>
                    <Text color="secondary">{votingPower.toString()}</Text>
                </Flex>
                ) : (
                    <>
                    <Flex justifyContent="center">
                    <Text mr="12px" mb="8px">{t('Your Voting Power:')}</Text>
                    <Text color="secondary">{gettingWeight ? (<Dots/>) : t('Not Available')}</Text>
                    </Flex>
                    <Text color="warning" fontSize="12px" mb="8px">{t('Calculate your voting power to vote on this proposal')}</Text>
                    </>
                )}

                { proposal && (
                    <>
                    {
                        isActive && !hasCalculatedWeight && (
                            <Flex paddingX="8px">
                                <Button disabled={pendingTx||gettingWeight} onClick={handleCalculate}>
                                    {t('Calculate My Voting Power')}
                                </Button>
                            </Flex>
                        )
                    }
                    {
                        hasCalculatedWeight && (
                        <Flex flexDirection="column">
                            { hasVoted && (
                                <Flex justifyContent="center" mb="8px">
                                    <Text color="info">{t('You have voted already')}</Text>
                                </Flex>
                            )}

                            {isActive && (
                                <Flex>
                                    <Flex paddingX="8px">
                                        <Button variant="success" disabled={pendingTx || !hasCalculatedWeight || hasVoted} onClick={() => handleVote(VoteType.For)}>
                                            {t('For')}
                                        </Button>
                                    </Flex>
                                    <Flex paddingX="8px">
                                        <Button variant="danger" disabled={pendingTx || !hasCalculatedWeight || hasVoted} onClick={() => handleVote(VoteType.Against)}>
                                            {t('Against')}
                                        </Button>
                                    </Flex>
                                    <Flex paddingX="8px">
                                        <Button variant="primary" disabled={pendingTx|| !hasCalculatedWeight || hasVoted} onClick={() => handleVote(VoteType.Abstain)}>
                                            {t('Abstained')}
                                        </Button>
                                    </Flex>
                                </Flex>
                            )}
                        </Flex>
                        )
                    }
                    </>
                )}
            </Flex>
        </Wrapper>
    )
}


export default ProposalAction