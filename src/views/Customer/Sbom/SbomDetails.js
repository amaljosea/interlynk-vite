import { useLazyQuery } from '@apollo/client'
import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince } from 'utils'
import { truncatedValue } from 'utils'

import { DownloadIcon, Search2Icon } from '@chakra-ui/icons'
import {
  Badge,
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

import { GetSharPrimartComp } from 'graphQL/Queries'

import {
  FaAngleLeft,
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes
} from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'

const SbomDetails = ({ sbomData }) => {
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
  const { prodCompState, dispatch } = useGlobalState()
  const { field, direction } = prodCompState
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { isOpen, onOpen, onClose } = useDisclosure()

  // GET PRIMARY COMPONENT
  const [getPrimaryComp, { data: primaryComp }] = useLazyQuery(
    GetSharPrimartComp,
    { fetchPolicy: 'network-only' }
  )

  const handleRelationView = async () => {
    await getPrimaryComp({
      variables: {
        sbomId: sbomId,
        primary: true,
        field,
        direction
      }
    }).then((res) => res?.data && onOpen())
  }

  const onSelectComp = () => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    setActiveTab('components')
  }

  const onSelectVulns = () => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({
      type: 'FILTER_INCLUDE',
      payload: sbomParts?.length > 0 ? ['parts'] : []
    })
    setActiveTab('vulnerabilities')
  }

  const onSelectLicenses = () => {
    setActiveTab('licenses')
  }

  const onFilterVuln = (value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({
      type: 'FILTER_INCLUDE',
      payload: sbomParts?.length > 0 ? ['parts'] : []
    })
    setActiveTab('vulnerabilities')
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
      if (sbomData?.vulnRunStatus === 'IN_PROGRESS') {
        refetchActiveQueries()
      } else {
        clearInterval(refetchInterval)
      }
    }, 5000)

    return () => clearInterval(refetchInterval)
  }, [sbomData, projectId, sbomId])

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
          <Stack spacing={1} direction={'column'} alignItems={'left'}>
            {projectId && partsContext.latestPart && (
              <Link to={partsContext.latestPart.url} onClick={handlePart}>
                <HStack>
                  <FaAngleLeft size={18} color='#3182CE' />
                  <Text
                    width={'fit-content'}
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
              <Text fontWeight={'semibold'} fontSize={25} width={'fit-content'}>
                {truncatedValue(project?.projectGroup?.name, 36)}
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
            my={2}
            gap={2}
            width='100%'
            flexDir='row'
            alignItems={'center'}
            hidden={signedUrlParams}
          >
            <Tooltip label='Imported'>
              <IconButton
                size='xs'
                colorScheme={'blue'}
                icon={<DownloadIcon />}
              />
            </Tooltip>
            <Tooltip label='SBOM Checks'>
              <IconButton
                size='xs'
                colorScheme={
                  vulnRunStatus === 'FINISHED' ||
                  vulnRunStatus === 'IN_PROGRESS'
                    ? 'blue'
                    : 'blackAlpha'
                }
                icon={<Search2Icon />}
              />
            </Tooltip>
            <Tooltip label='Vulnerability Scan'>
              <IconButton
                size='xs'
                colorScheme={
                  vulnRunStatus === 'FINISHED' ? 'blue' : 'blackAlpha'
                }
                icon={<FaBug />}
              />
            </Tooltip>
            <Tooltip label='Ready'>
              <IconButton
                size='xs'
                colorScheme={
                  vulnRunStatus === 'FINISHED' ? 'blue' : 'blackAlpha'
                }
                icon={<FaCircleCheck />}
              />
            </Tooltip>
            {vulnRunStatus === 'IN_PROGRESS' && (
              <Badge px={2} py={1} fontWeight={'semibold'}>
                Scanning...
              </Badge>
            )}
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
                    onClick={() => onFilterVuln(['critical'])}
                  >
                    {critical ? critical : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='orange'
                    label='High'
                    onClick={() => onFilterVuln(['high'])}
                  >
                    {high ? high : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='yellow'
                    label='Medium'
                    onClick={() => onFilterVuln(['medium'])}
                  >
                    {medium ? medium : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='green'
                    label='Low'
                    onClick={() => onFilterVuln(['low'])}
                  >
                    {low ? low : 0}
                  </VulnBadge>
                  <VulnBadge
                    color='gray'
                    label='Unknown'
                    onClick={() => onFilterVuln(['unknown'])}
                  >
                    {unknown ? unknown : 0}
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
