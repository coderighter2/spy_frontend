import React, { useEffect, useCallback, useState, useMemo, useRef, ChangeEvent, lazy, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { format } from 'date-fns'
import { Image, Heading, RowType, Toggle, Text, Button, ArrowForwardIcon, Flex, Box, Input, Card, CardHeader, CardBody, AutoRenewIcon, Skeleton } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Select, { OptionProps } from 'components/Select/Select'
import Page, { PageMeta } from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { useGovernance, useGovernanceDevAddress, usePollGovernancePublicData } from 'state/governance/hooks'
import { usePollFarmsPublicData } from 'state/farms/hooks'
import useRefresh from 'hooks/useRefresh'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useToast from 'hooks/useToast'
import NotFound from 'views/NotFound'
import Dots from 'components/Loader/Dots'
import Markdown from '../../components/Markdown'
import Layout from '../../components/Layout'
import { FormState } from './types'
import { getFormErrors, useAPYCalcuation, useOldAPYCalcuation } from './helpers'
import { FormErrors, Label } from './styles'
import { VOTE_THRESHOLD } from '../../config'
import { ProposalCommand } from '../../types'
import useCreateProposal, { useInstantExecuteProposal } from '../../hooks/useCreateProposal'
import { useProposalAdmin } from '../../hooks/getProposal'

const EasyMde = lazy(() => import('components/EasyMde'))
const CreateProposal: React.FC = () => {

    const history = useHistory()
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const { toastError, toastSuccess } = useToast()
    const devAddr = useGovernanceDevAddress()
    const {data: governanceData} = useGovernance()
    const [currentTime, setCurrentTime] = useState(new Date().getTime() / 1000)
    const {slowRefresh} = useRefresh()
    const [isLoading, setIsLoading] = useState(false)
    const [executing, setExecuting] = useState(false)
    const [state, setState] = useState<FormState>({
      name: '',
      body: '',
      targetApy: '1000',
      apyMultiplier: '1',
      command: ProposalCommand.ADJUST_FARM_APY,
      nftRefillAmount: '60000',
      apyHarvestInterval: '1166400'
    })
    const [fieldsState, setFieldsState] = useState<{ [key: string]: boolean }>({})
    const { name, body, command, targetApy, apyMultiplier, apyHarvestInterval, nftRefillAmount } = state
    const formErrors = getFormErrors(state, t)
    const [checkingAdmin, isAdmin] = useProposalAdmin()

    const commandOptions: OptionProps[] = [
        {
            label: 'Adjust Farming Pools APY',
            value: ProposalCommand.ADJUST_FARM_APY
        },
        {
            label: 'Adjust Farming Pools APY (Old)',
            value: ProposalCommand.ADJUST_FARM_APY_OLD
        },
        {
            label: 'Refill NFT Pools',
            value: ProposalCommand.REFILL_NFT
        }
    ]

    const apyParams = useAPYCalcuation(targetApy, targetApy, targetApy, apyMultiplier)
    const oldApyParams = useOldAPYCalcuation(targetApy, targetApy, targetApy, apyMultiplier)
    const {onCreateProposal} = useCreateProposal()
    const {onInstantExecuteProposal} = useInstantExecuteProposal(account)

    const estimatedStartTime = useMemo(() => {
        return governanceData.delay ? governanceData.delay + currentTime : 0
    }, [governanceData, currentTime])

    const estimatedEndTime = useMemo(() => {
        return governanceData.delay && governanceData.period ? governanceData.period + governanceData.delay + currentTime : 0
    }, [governanceData, currentTime])

    const estimatedExecutionTime = useMemo(() => {
        return governanceData.delay && governanceData.period ? governanceData.period + governanceData.delay + currentTime + 60 * 30 : 0
    }, [governanceData, currentTime])

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
          hideIcons:
            isAdmin
              ? []
              : ['guide', 'fullscreen', 'preview', 'side-by-side', 'image'],
        }
      }, [isAdmin])

    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const { name: inputName, value } = evt.currentTarget
        updateValue(inputName, value)
    }

    const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        await handleCreate();
    }

    const handleExecute = useCallback(async () => {
        console.log('here2')
        try {
            setExecuting(true)
            const apyParams_ = command === ProposalCommand.ADJUST_FARM_APY_OLD ? oldApyParams : apyParams
            await onInstantExecuteProposal({
                command,
                title: name,
                description: body,
                nftRefillAmount,
                spyPerBlock: apyParams_.spyPerBlock,
                baseAllocPoint: apyParams_.baseAllocPoint,
                harvestInterval: apyHarvestInterval,
                pids: ['0', '1', '4'],
                allocPoints: [apyParams_.busdAllocPoint, apyParams_.bnbAllocPoint, apyParams_.usdcAllocPoint]
            })
            toastSuccess(t('Success'), t('You have executed the proposal instantly.'))
        } catch (e) {
            console.log('e', e)
            const error = e as any
            const msg = error?.data?.message ?? error?.message ?? t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
            toastError(
              t('Error'),
              msg,
            )
        } finally {
            setExecuting(false)
        }
    }, [onInstantExecuteProposal, toastError, toastSuccess, t, command, name, body, nftRefillAmount, apyParams, oldApyParams, apyHarvestInterval])

    const handleCreate = useCallback(async () => {
        try {
            setIsLoading(true)
            const apyParams_ = command === ProposalCommand.ADJUST_FARM_APY_OLD ? oldApyParams : apyParams
            const proposalId = await onCreateProposal({
                command,
                title: name,
                description: body,
                nftRefillAmount,
                spyPerBlock: apyParams_.spyPerBlock,
                baseAllocPoint: apyParams_.baseAllocPoint,
                harvestInterval: apyHarvestInterval,
                pids: ['0', '1', '4'],
                allocPoints: [apyParams_.busdAllocPoint, apyParams_.bnbAllocPoint, apyParams_.usdcAllocPoint]
            })
            history.push(`/governance/proposal/${proposalId}`);
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
    }, [onCreateProposal, toastError, toastSuccess, history, t, command, name, body, nftRefillAmount, apyParams, oldApyParams, apyHarvestInterval])

    if (checkingAdmin) {
        return (
            <Container py="40px">
            <PageMeta />
            <Box>
            <Skeleton width="100%" height="400px" animation="waves"/>
            </Box>
            </Container>
        )
    }

    if (!isAdmin) {
        return (
            <NotFound/>
        )
    }

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
                        {t('On-chain governance is a system for managing and implementing changes to cryptocurrency blockchains. In this type of governance, rules for instituting changes are encoded into the blockchain protocol. Developers propose changes through code updates and each node votes on whether to accept or reject the proposed change')}
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
                                    <Label htmlFor="command">{t('Type')}</Label>
                                    <Select
                                        id="command"
                                        options={commandOptions}
                                        onOptionChange={(option)=>updateValue('command', option.value)}
                                        />
                                </Box>
                                { command === ProposalCommand.ADJUST_FARM_APY && (
                                    <>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('Target APY')}</Label>
                                        <Input id="targetApy" name="targetApy" value={targetApy} scale="lg" onChange={handleChange} required />
                                        {formErrors.targetApy && fieldsState.targetApy && <FormErrors errors={formErrors.targetApy} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('APY Multiplier e.g. 100')}</Label>
                                        <Input id="apyMultiplier" name="apyMultiplier" value={apyMultiplier} scale="lg" onChange={handleChange} required />
                                        {formErrors.apyMultiplier && fieldsState.apyMultiplier && <FormErrors errors={formErrors.apyMultiplier} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('Harvest Interval in seconds. e.g. 1166400')}</Label>
                                        <Input id="apyHarvestInterval" name="apyHarvestInterval" value={apyHarvestInterval} scale="lg" onChange={handleChange} required />
                                        {formErrors.apyHarvestInterval && fieldsState.apyHarvestInterval && <FormErrors errors={formErrors.apyHarvestInterval} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Text color="warning">{t('The following parameters are calculated based on the current state of the farming pools. So actual APY won\'t be exactly same as "Target APY"')}</Text>
                                        <Text fontSize="14px">spyPerBlock: {apyParams.spyPerBlock}</Text>
                                        <Text fontSize="14px">baseAllocPoint: {apyParams.baseAllocPoint}</Text>
                                        <Text fontSize="14px">(0)SPY-BUSD: {apyParams.busdAllocPoint}</Text>
                                        <Text fontSize="14px">(1)SPY-BNB: {apyParams.bnbAllocPoint}</Text>
                                        <Text fontSize="14px">(4)SPY-USDC: {apyParams.usdcAllocPoint}</Text>
                                    </Box>
                                    </>
                                ) }
                                { command === ProposalCommand.ADJUST_FARM_APY_OLD && (
                                    <>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('Target APY')}</Label>
                                        <Input id="targetApy" name="targetApy" value={targetApy} scale="lg" onChange={handleChange} required />
                                        {formErrors.targetApy && fieldsState.targetApy && <FormErrors errors={formErrors.targetApy} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('APY Multiplier e.g. 100')}</Label>
                                        <Input id="apyMultiplier" name="apyMultiplier" value={apyMultiplier} scale="lg" onChange={handleChange} required />
                                        {formErrors.apyMultiplier && fieldsState.apyMultiplier && <FormErrors errors={formErrors.apyMultiplier} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('Harvest Interval in seconds. e.g. 1166400')}</Label>
                                        <Input id="apyHarvestInterval" name="apyHarvestInterval" value={apyHarvestInterval} scale="lg" onChange={handleChange} required />
                                        {formErrors.apyHarvestInterval && fieldsState.apyHarvestInterval && <FormErrors errors={formErrors.apyHarvestInterval} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Text color="warning">{t('The following parameters are calculated based on the current state of the farming pools. So actual APY won\'t be exactly same as "Target APY"')}</Text>
                                        <Text fontSize="14px">spyPerBlock: {oldApyParams.spyPerBlock}</Text>
                                        <Text fontSize="14px">baseAllocPoint: {oldApyParams.baseAllocPoint}</Text>
                                        <Text fontSize="14px">(0)SPY-BUSD: {oldApyParams.busdAllocPoint}</Text>
                                        <Text fontSize="14px">(1)SPY-BNB: {oldApyParams.bnbAllocPoint}</Text>
                                        <Text fontSize="14px">(4)SPY-USDC: {oldApyParams.usdcAllocPoint}</Text>
                                    </Box>
                                    </>
                                ) }
                                { command === ProposalCommand.REFILL_NFT && (
                                    <>
                                    <Box mb="24px">
                                        <Label htmlFor="targetApy">{t('SPY Amount')}</Label>
                                        <Input id="nftRefillAmount" name="nftRefillAmount" value={nftRefillAmount} scale="lg" onChange={handleChange} required />
                                        {formErrors.nftRefillAmount && fieldsState.nftRefillAmount && <FormErrors errors={formErrors.nftRefillAmount} />}
                                    </Box>
                                    <Box mb="24px">
                                        <Text color="warning">{t('You need to send SPY to NFT reward pool maunally')}</Text>
                                    </Box>
                                    </>
                                ) }
                                {account ? (
                                <>
                                    <Button
                                    type="submit"
                                    width="100%"
                                    isLoading={isLoading}
                                    endIcon={isLoading ? <AutoRenewIcon spin color="currentColor" /> : null}
                                    disabled={!isEmpty(formErrors) || executing}
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

                                    <Text my="16px">
                                        {t('Or')}
                                    </Text>

                                    <Button
                                        as="a"
                                        disabled={executing || isLoading || !isEmpty(formErrors)}
                                        onClick={handleExecute}
                                    >
                                        {executing ? (<Dots>{t('Processing')}</Dots>) : t('Instant Execute')}
                                    </Button>
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