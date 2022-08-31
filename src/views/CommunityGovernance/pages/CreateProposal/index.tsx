import React, { useEffect, useCallback, useState, useMemo, useRef, ChangeEvent, lazy, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { format } from 'date-fns'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex, Box, Input, Card, CardHeader, CardBody, AutoRenewIcon, Skeleton } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page, { PageMeta } from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { useGovernance, useGovernanceDevAddress, usePollGovernancePublicData } from 'state/governance/hooks'
import { usePollFarmsPublicData } from 'state/farms/hooks'
import useRefresh from 'hooks/useRefresh'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useToast from 'hooks/useToast'
import Markdown from '../../components/Markdown'
import Layout from '../../components/Layout'
import { FormState } from './types'
import { getFormErrors } from './helpers'
import { FormErrors, Label } from './styles'
import { VOTE_THRESHOLD } from '../../config'
import { ProposalCommand } from '../../types'
import useCreateProposal from '../../hooks/useCreateProposal'

const EasyMde = lazy(() => import('components/EasyMde'))
const CreateProposal: React.FC = () => {

    const history = useHistory()
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const { toastError, toastSuccess } = useToast()
    const {data: governanceData} = useGovernance()
    const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000)
    const {slowRefresh} = useRefresh()
    const [isLoading, setIsLoading] = useState(false)
    const [state, setState] = useState<FormState>({
      name: '',
      body: '',
      durationInHours: '24',
      executionDurationInHours: '8',
    })
    const [fieldsState, setFieldsState] = useState<{ [key: string]: boolean }>({})
    const { name, body, durationInHours, executionDurationInHours } = state
    const formErrors = getFormErrors(state, t)

    const {onCreateProposal} = useCreateProposal()

    const estimatedStartTime = useMemo(() => {
        return governanceData.delay ? governanceData.delay + currentTime : 0
    }, [governanceData, currentTime])

    const estimatedEndTime = useMemo(() => {
        return governanceData.delay ? governanceData.delay + currentTime  + parseInt(durationInHours) * 3600: 0
    }, [governanceData, currentTime, durationInHours])

    const estimatedExecutionTime = useMemo(() => {
        return governanceData.delay ? governanceData.delay + currentTime + parseInt(durationInHours) * 3600 + parseInt(executionDurationInHours) * 3600 : 0
    }, [governanceData, currentTime, durationInHours, executionDurationInHours])

    useEffect(() => {
        setCurrentTime(new Date().getTime() / 1000)
    }, [slowRefresh])

    usePollGovernancePublicData()
    usePollFarmsPublicData()

    const updateValue = (key: string, value: string | Date | ProposalCommand) => {
        setState((prevState) => ({
            ...prevState,
            [key]: value,
        }))
    
        // Keep track of what fields the user has attempted to edit
        setFieldsState((prevFieldsState) => ({
            ...prevFieldsState,
            [key]: true,
        }))
    }

    const handleEasyMdeChange = (value: string) => {
        updateValue('body', value)
    }

    const options = useMemo(() => {
        return {
          hideIcons:[]
        }
      }, [])

    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const { name: inputName, value } = evt.currentTarget
        updateValue(inputName, value)
    }

    const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        await handleCreate();
    }

    const handleCreate = useCallback(async () => {
        try {
            setIsLoading(true)
            const proposalId = await onCreateProposal({
                title: name,
                description: body,
                duration : parseInt(durationInHours) * 3600,
                executionDuration: parseInt(executionDurationInHours) * 3600
            })
            history.push(`/governance/community/${proposalId}`);
            toastSuccess(t('Success'), t('You have created the proposal successfully.'))
        } catch (e) {
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setIsLoading(false)
        }
    }, [onCreateProposal, toastError, toastSuccess, history, t, name, body, durationInHours, executionDurationInHours])

    return (
        <>
        <Container py="40px">
            <PageMeta />
            <Box mb="48px">
                <Flex flexDirection="column">
                    <Flex justifyContent="space-between">
                        <Heading scale="xl" color="secondary" mb="12px">
                            {t('Make a Proposal')}
                        </Heading>
                    </Flex>
                    <Text color="text" width={["100%", null, null, "80%"]}>
                        {t('On-chain governance is a system for managing and implementing changes to cryptocurrency blockchains. Users can propose a proposal for this ecosystem\'s improvement')}
                    </Text>
                </Flex>
            </Box>
            <form onSubmit={handleSubmit}>
                <Layout>
                    <Box>
                        <Box mb="24px">
                            <Label htmlFor="name">{t('Title')}</Label>
                            <Input id="name" name="name" value={name} scale="lg" onChange={handleChange} required />
                            {formErrors.name && fieldsState.name && <FormErrors errors={formErrors.name} />}
                        </Box>
                        <Box mb="24px">
                            <Label htmlFor="body">{t('Content')}</Label>
                            <Text color="textSubtle" mb="8px">
                                {t('Tip: write in Markdown!')}
                            </Text>
                            <EasyMde
                                id="body"
                                name="body"
                                onTextChange={handleEasyMdeChange}
                                value={body}
                                options={options}
                                required
                            />
                            {formErrors.body && fieldsState.body && <FormErrors errors={formErrors.body} />}
                        </Box>
                        <Box mb="24px">
                            <Label >{t('Content Preview')}</Label>
                            <Markdown>
                                {body}
                            </Markdown>
                        </Box>
                    </Box>
                    <Box>
                        <Card>
                            <CardHeader>
                                <Heading as="h3" scale="md">
                                {t('Actions')}
                                </Heading>
                            </CardHeader>
                            <CardBody>

                                <Box mb="24px">
                                    <Label htmlFor="targetApy">{t('Duration (in hours)')}</Label>
                                    <Input id="durationInHours" name="durationInHours" value={durationInHours} scale="lg" onChange={handleChange} required />
                                    {formErrors.durationInHours && fieldsState.durationInHours && <FormErrors errors={formErrors.durationInHours} />}
                                </Box>

                                <Box mb="24px">
                                    <Label htmlFor="targetApy">{t('Execution Expiration (in hours)')}</Label>
                                    <Input id="executionDurationInHours" name="executionDurationInHours" value={executionDurationInHours} scale="lg" onChange={handleChange} required />
                                    {formErrors.executionDurationInHours && fieldsState.executionDurationInHours && <FormErrors errors={formErrors.executionDurationInHours} />}
                                </Box>
                                {account ? (
                                <>
                                    <Button
                                    type="submit"
                                    width="100%"
                                    isLoading={isLoading}
                                    endIcon={isLoading ? <AutoRenewIcon spin color="currentColor" /> : null}
                                    disabled={!isEmpty(formErrors)}
                                    mb="16px"
                                    >
                                    {t('Publish')}
                                    </Button>
                                    <Text color="failure" as="p" mb="4px">
                                    {t('You need at least %count% voting power to publish a proposal.', { count: VOTE_THRESHOLD })}{' '}
                                    </Text>
                                    <Flex flexDirection="column">
                                        <Flex justifyContent="space-between">
                                            <Text fontSize="14px">{t('Start Date/Time: ')}</Text>
                                            <Text fontSize="14px" color="secondary">{estimatedStartTime ? format(new Date(estimatedStartTime * 1000), 'MMMM dd yyyy hh:mm aa') : '-'}</Text>
                                        </Flex>
                                        <Flex justifyContent="space-between">
                                            <Text fontSize="14px">{t('End Date/Time: ')}</Text>
                                            <Text fontSize="14px" color="secondary">{estimatedEndTime ? format(new Date(estimatedEndTime * 1000), 'MMMM dd yyyy hh:mm aa') : '-'}</Text>
                                        </Flex>
                                        <Flex justifyContent="space-between">
                                            <Text fontSize="14px">{t('Execution Time: ')}</Text>
                                            <Text fontSize="14px" color="secondary">{estimatedExecutionTime ? format(new Date(estimatedExecutionTime * 1000), 'MMMM dd yyyy hh:mm aa') : '-'}</Text>
                                        </Flex>
                                    </Flex>
                                </>
                                ) : (
                                <ConnectWalletButton width="100%" type="button" />
                                )}
                            </CardBody>
                        </Card>
                    </Box>
                </Layout>
            </form>
        </Container>
        </>
    )
}


export default CreateProposal