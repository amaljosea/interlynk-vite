import { useLazyQuery, useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince } from 'utils'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import {
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import GraphDrawer from 'components/Drawer/GraphDrawer'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import {
  GetPrimaryComponent,
  GetProjectSettings,
  GetSharPrimartComp
} from 'graphQL/Queries'

import {
  FaAngleLeft,
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes,
  FaRobot
} from 'react-icons/fa'
import { FaCircleCheck, FaTag } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'

const SettingsTag = ({ icon, label, color }) => {
  return (
    <Tooltip label={label}>
      <IconButton size='xs' icon={icon} colorScheme={color} />
    </Tooltip>
  )
}

const SbomDetails = ({ sbomData, refetch }) => {
  const partsContext = usePartsContext()
  const navigate = useNavigate()
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const setActiveTab = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: value
      }
    })
    navigate(link)
  }

  const {
    project,
    policyResultMetrics,
    projectVersion,
    primaryComponent,
    vulnRunStatus,
    updatedAt,
    lifecycle,
    stats,
    sbomParts
  } = sbomData || ''
  const { compCount, compLicenseCount, vulnStats } = stats || ''
  const { critical, high, medium, low, unknown } = vulnStats || ''
  const { prodCompState, setActiveCsSbomTab, dispatch } = useGlobalState()
  const { field, direction } = prodCompState
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { isOpen, onOpen, onClose } = useDisclosure()

  // GET PRIMARY COMPONENT
  const [getPrimaryComp, { data: primaryComp }] = useLazyQuery(
    signedUrlParams ? GetSharPrimartComp : GetPrimaryComponent,
    { fetchPolicy: 'network-only' }
  )

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: projectId }
  })

  const { projectSetting } = settings?.project || ''
  const {
    checksEnabled,
    vulnScanningEnabled: vulnScan,
    internalCompMatchingEnabled: internalComp,
    automatedFixesEnabled
  } = projectSetting || ''
  const hasFinished = vulnRunStatus === 'FINISHED'

  const handleRelationView = async () => {
    await getPrimaryComp({
      variables: {
        projectId: signedUrlParams ? undefined : projectId,
        sbomId: sbomId,
        primary: true,
        field,
        direction
      }
    }).then((res) => res?.data && onOpen())
  }

  const onSelectComp = () => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    if (signedUrlParams) {
      setActiveCsSbomTab(2)
    } else {
      setActiveTab('components')
    }
  }

  const onSelectVulns = () => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    if (signedUrlParams) {
      setActiveCsSbomTab(3)
    } else {
      prodVulnDispatch({
        type: 'FILTER_INCLUDE',
        payload: sbomParts?.length > 0 ? ['parts'] : []
      })
      setActiveTab('vulnerabilities')
    }
  }

  const onSelectLicenses = () => {
    if (signedUrlParams) {
      setActiveCsSbomTab(4)
    } else {
      setActiveTab('licenses')
    }
  }

  const onSelectPolicy = () => {
    if (signedUrlParams) {
      return null
    } else {
      setActiveTab('policies')
    }
  }

  const onFilterVuln = (value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({
      type: 'FILTER_INCLUDE',
      payload: sbomParts?.length > 0 ? ['parts'] : []
    })
    if (signedUrlParams) {
      setActiveCsSbomTab(3)
    } else {
      setActiveTab('vulnerabilities')
    }
  }

  const handlePart = () => {
    partsContext.pop()
  }

  useEffect(() => {
    window.onpopstate = () => {
      console.log(`Pressed back button`)
      handlePart()
    }
  })

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      if (vulnRunStatus === 'IN_PROGRESS') {
        refetch({ projectId, sbomId })
      } else {
        clearInterval(refetchInterval)
      }
    }, 5000)

    return () => clearInterval(refetchInterval)
  }, [refetch, projectId, sbomId, vulnRunStatus])

  return (
    <>
      <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'}>
        <Icon
          as={FaCubes}
          h={'64px'}
          w={'64px'}
          color='blue.300'
          onClick={handleRelationView}
          cursor={'pointer'}
        />
        <Flex direction={'column'} gap={0.5}>
          {/* PRODUCT TITLE */}
          <Stack direction={'column'} spacing={1} alignItems={'left'}>
            {projectId &&
              partsContext.isParts &&
              sbomId &&
              partsContext.latestPart && (
                <Link to={partsContext.latestPart.url} onClick={handlePart}>
                  <HStack>
                    <FaAngleLeft size={18} color='#3182CE' />
                    <Text
                      fontWeight={'semibold'}
                      fontSize={18}
                      color={'blue.500'}
                      textDecor={'underline'}
                    >
                      {partsContext.latestPart.projectGroupName}
                    </Text>
                  </HStack>
                </Link>
              )}
            <Flex
              direction={'row'}
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={2}
            >
              <Text fontWeight={'semibold'} fontSize={25}>
                {project?.projectGroup?.name}
              </Text>
            </Flex>
          </Stack>
          <Flex flexDir={'row'} gap={1} alignItems={'center'} flexWrap={'wrap'}>
            <Text fontSize={22}>{primaryComponent?.name}</Text>
            <Text fontSize={22}>{primaryComponent?.version ? ':' : ''}</Text>
            <Text mr={2} fontSize={22}>
              {projectVersion}
            </Text>
            <Tooltip label='Lifecycle stage' fontSize='md'>
              <Tag
                w={'fit-content'}
                size={'sm'}
                variant='solid'
                colorScheme='blue'
              >
                <TagLabel textTransform={'capitalize'}>{lifecycle}</TagLabel>
              </Tag>
            </Tooltip>
          </Flex>
          <Text fontSize={'sm'} my={1}>
            {primaryComponent?.description}
          </Text>
          {/* SCAN STATUS */}
          <Flex
            mb={2}
            gap={2}
            width='100%'
            flexDir='row'
            alignItems={'center'}
            hidden={signedUrlParams}
          >
            <SettingsTag
              color={'blue'}
              label={'Imported'}
              icon={<DownloadIcon />}
            />
            <SettingsTag
              color={checksEnabled ? 'blue' : 'blackAlpha'}
              label={'Checks'}
              icon={<Search2Icon />}
            />
            <SettingsTag
              color={internalComp ? 'blue' : 'blackAlpha'}
              label={'Internal Labeling'}
              icon={<FaTag />}
            />
            <SettingsTag
              color={automatedFixesEnabled ? 'blue' : 'blackAlpha'}
              label={'Automation'}
              icon={<FaRobot />}
            />
            <SettingsTag
              color={hasFinished && vulnScan ? 'blue' : 'blackAlpha'}
              label={'Vulnerability Scan'}
              icon={<FaBug />}
            />
            <SettingsTag
              label={'Ready'}
              color={hasFinished ? 'blue' : 'blackAlpha'}
              icon={<FaCircleCheck />}
            />
          </Flex>
          {/* UPDATED AT */}
          <Tooltip placement='top' label={getFullDateAndTime(updatedAt)}>
            <Text width={'fit-content'} fontSize='xs' cursor={'pointer'}>
              Updated {timeSince(updatedAt)}
            </Text>
          </Tooltip>
          {/* STATS */}
          <Flex flexDir={'row'} alignItems={'center'} gap={8} mt={5}>
            {/* COMPONENTS */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon h={4} w={4} mt={1} color='#777' as={FaCube} />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Tag
                  size='md'
                  variant='subtle'
                  width={'full'}
                  colorScheme={'blue'}
                  cursor={'pointer'}
                  onClick={onSelectComp}
                >
                  <TagLabel mx={'auto'}>{compCount}</TagLabel>
                </Tag>
                <Text
                  mt={1}
                  fontSize={'xs'}
                  cursor={'pointer'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectComp}
                >
                  Components
                </Text>
              </Flex>
            </Stack>
            {/* LICENSES */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon
                mt={1}
                h={'20px'}
                w={'20px'}
                color='#777'
                as={FaBalanceScale}
              />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Tag
                  cursor={'pointer'}
                  size='md'
                  variant='subtle'
                  width={16}
                  colorScheme={'blue'}
                  onClick={onSelectLicenses}
                >
                  <TagLabel mx={'auto'}>{compLicenseCount}</TagLabel>
                </Tag>
                <Text
                  cursor={'pointer'}
                  mt={1}
                  fontSize={'xs'}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectLicenses}
                >
                  Licenses
                </Text>
              </Flex>
            </Stack>
            {/* VULNERABILITIES */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon mt={1} h={4} w={4} color='#777' as={FaBug} />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Stack fontWeight={'medium'} direction={'row'}>
                  <VulnBadge
                    color='red'
                    label='Critical'
                    status={vulnRunStatus}
                    onClick={() => onFilterVuln(['critical'])}
                  >
                    {critical || 0}
                  </VulnBadge>
                  <VulnBadge
                    color='orange'
                    label='High'
                    status={vulnRunStatus}
                    onClick={() => onFilterVuln(['high'])}
                  >
                    {high || 0}
                  </VulnBadge>
                  <VulnBadge
                    color='yellow'
                    label='Medium'
                    status={vulnRunStatus}
                    onClick={() => onFilterVuln(['medium'])}
                  >
                    {medium || 0}
                  </VulnBadge>
                  <VulnBadge
                    color='green'
                    label='Low'
                    status={vulnRunStatus}
                    onClick={() => onFilterVuln(['low'])}
                  >
                    {low || 0}
                  </VulnBadge>
                  <VulnBadge
                    color='gray'
                    label='Unknown'
                    status={vulnRunStatus}
                    onClick={() => onFilterVuln(['unknown'])}
                  >
                    {unknown || 0}
                  </VulnBadge>
                </Stack>
                <Text
                  mt={1}
                  fontSize={'xs'}
                  style={{ cursor: 'pointer' }}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectVulns}
                >
                  Vulnerabilities
                </Text>
              </Flex>
            </Stack>
            {/* POLICY RESULTS */}
            <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
              <Icon mt={1} h={5} w={5} color='#777' as={MdPolicy} />
              <Flex flexDir={'column'} alignItems={'center'}>
                <Stack fontWeight={'medium'} direction={'row'}>
                  <VulnBadge color='red' label='Fail'>
                    {policyResultMetrics?.failedCount || 0}
                  </VulnBadge>
                  <VulnBadge color='yellow' label='Warn'>
                    {policyResultMetrics?.warnCount || 0}
                  </VulnBadge>
                  <VulnBadge color='blue' label='Inform'>
                    {policyResultMetrics?.informCount || 0}
                  </VulnBadge>
                  <VulnBadge color='green' label='Pass'>
                    {policyResultMetrics?.passedCount || 0}
                  </VulnBadge>
                  <VulnBadge color='orange' label='Skipped'>
                    {policyResultMetrics?.skippedCount || 0}
                  </VulnBadge>
                  <VulnBadge color='gray' label='Error'>
                    {policyResultMetrics?.errorCount || 0}
                  </VulnBadge>
                </Stack>
                <Text
                  mt={1}
                  fontSize={'xs'}
                  style={{ cursor: 'pointer' }}
                  _hover={{ textDecoration: 'underline' }}
                  onClick={onSelectPolicy}
                >
                  Policy Results
                </Text>
              </Flex>
            </Stack>
          </Flex>
        </Flex>
      </Flex>

      {isOpen && primaryComp && (
        <GraphDrawer
          isOpen={isOpen}
          onClose={onClose}
          primaryComp={
            signedUrlParams
              ? primaryComp?.shareLynkQuery?.sbom?.components
              : primaryComp?.sbom?.components
          }
          activeComp={null}
        />
      )}
    </>
  )
}

export default SbomDetails
