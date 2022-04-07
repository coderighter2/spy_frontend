import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { Flex, Button, Text } from '@pancakeswap/uikit'
import { BSC_BLOCK_TIME } from 'config'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useBlock } from 'state/block/hooks'
import Dots from 'components/Loader/Dots'
import { Proposal, ProposalState, ProposalStates } from '../../types'
import useCancelProposal from '../../hooks/useCancelProposal'
import useQueueProposal from '../../hooks/useQueueProposal'
import useExecuteProposal from '../../hooks/useExecuteProposal'

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
    proposalId: string
    proposal?: Proposal
    reloadProposal?: () => void
}

const ProposalAdminAction: React.FC<ProposalActionProps> = ({proposalId, proposal, reloadProposal}) => {

    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const { currentBlock } = useBlock()
    const [pendingTx, setPendingTx] = useState(false)
    const [queueingTx, setQueueingTx] = useState(false)
    const [cancelingTx, setCancelingTx] = useState(false)
    const {onCancelProposal} = useCancelProposal()
    const {onQueueProposal} = useQueueProposal()
    const {onExecuteProposal} = useExecuteProposal()

    const handleCancel = useCallback(async () => {
        try {
            setCancelingTx(true)
            await onCancelProposal(proposalId)
            if (reloadProposal) reloadProposal()
            toastSuccess(t('Success'), t('You have canceled the proposal successfully.'))
        } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setCancelingTx(false)
        }
    }, [onCancelProposal, t, toastError, toastSuccess, reloadProposal, proposalId])

    const handleQueue = useCallback(async () => {
        try {
            setQueueingTx(true)
            await onQueueProposal(proposalId)
            if (reloadProposal) reloadProposal()
            toastSuccess(t('Success'), t('The proposal has been queued successfully.'))
        } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setQueueingTx(false)
        }
    }, [onQueueProposal, t, toastError, toastSuccess, reloadProposal, proposalId])

    const handleExecute = useCallback(async () => {
        try {
            setPendingTx(true)
            await onExecuteProposal(proposalId)
            if (reloadProposal) reloadProposal()
            toastSuccess(t('Success'), t('The proposal has been executed successfully.'))
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
    }, [onExecuteProposal, t, toastError, toastSuccess, reloadProposal, proposalId])

    const endTime = useMemo(() => {
        return proposal && currentBlock < proposal.endBlock ? new Date().getTime() / 1000 + BSC_BLOCK_TIME * (proposal.endBlock - currentBlock) : 0
    }, [proposal, currentBlock])

    const isActive = useMemo(() => {
        if (!proposal) return false
        if (proposal.executed || proposal.canceled) return false
        if (proposal.startBlock >= currentBlock) return false
        if (proposal.endBlock >= currentBlock) return true
        return false
    }, [proposal, currentBlock])

    if (!proposal || proposal.canceled) {
        return (
            <></>
        )
    }

    return (
        <Wrapper>

            <Flex flexDirection="column">
                <Flex mb="8px">
                    <Text mr="12px">{t('End at:')}</Text>
                    <Text>{endTime > 0 ? format(endTime * 1000, 'MM/dd/yy h:mm a') : 'Already Ended'}</Text>
                </Flex>
                <Flex mb="8px">
                    <Text mr="12px">{t('Status:')}</Text>
                    <Text>{ProposalStates[proposal.state]}</Text>
                </Flex>
                {proposal?.eta > 0 && (
                    <Flex mb="8px">
                        <Text mr="12px">{t('Proposal ETA:')}</Text>
                        <Text>{format(proposal?.eta * 1000, 'MM/dd/yy h:mm:ss a')}</Text>
                    </Flex>
                )}
                <Flex justifyContent="center">
                    <Flex paddingX="8px">
                        <Button onClick={handleExecute} disabled={pendingTx || cancelingTx || queueingTx || proposal.state !== ProposalState.Queued || proposal.endBlock >= currentBlock || proposal?.eta > new Date().getTime() / 1000}>
                            { pendingTx ? (<Dots>{t('Executing')}</Dots>) : t('Execute')}
                        </Button>
                    </Flex>
                    <Flex paddingX="8px">
                        <Button onClick={handleQueue} disabled={pendingTx || cancelingTx || queueingTx || proposal.state !== ProposalState.Succeeded  || proposal.endBlock >= currentBlock}>
                            { queueingTx ? (<Dots>{t('Queueing')}</Dots>) : t('Queue')}
                        </Button>
                    </Flex>
                    <Flex paddingX="8px">
                        <Button onClick={handleCancel} disabled={pendingTx || cancelingTx || queueingTx|| proposal.canceled || proposal.executed}>
                            { cancelingTx ? (<Dots>{t('Canceling')}</Dots>) : t('Cancel')}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Wrapper>
    )
}


export default ProposalAdminAction