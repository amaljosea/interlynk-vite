import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime, parseJSONSafely, timeSince } from 'utils'
import { getProductVersionDetailPageUrl } from 'utils/url'

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

import { GetPrimaryComponent } from 'graphQL/Queries'
import { GetSharPrimartComp } from 'graphQL/Queries'

import {
  FaAngleLeft,
  FaBalanceScale,
  FaBug,
  FaCube,
  FaCubes
} from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'

const SbomDetails = ({ sbom, getVulnData }) => {
  const {
    project,
    policyResultMetrics,
    projectVersion,
    primaryComponent,
    updatedAt,
    lifecycle,
    vulnRunStatus,
    stats
  } = sbom
  const { compCount, compLicenseCount, vulnStats } = stats
  const { critical, high, medium, low, unknown } = vulnStats
  const {
    totalRows,
    prodCompState,
    prodVulnState,
    setActiveSbomTab,
    setActiveCsSbomTab,
    dispatch
  } = useGlobalState()
  const { field, direction } = prodCompState
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const parts = queryParams.get('parts')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const subProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('subProduct'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const currentProduct = (() => {
    try {
      return parseJSONSafely(localStorage.getItem('product'))
    } catch (error) {
      console.log(error)
      return null
    }
  })()
  const id = localStorage.getItem('activeEnv')
  const { name } = currentProduct ? currentProduct : {}
  const currentSBOM = JSON.parse(localStorage.getItem(`currentSBOM`))

  const { isOpen, onOpen, onClose } = useDisclosure()

  // GET PRIMARY COMPONENT
  const [getPrimaryComp, { data: primaryComp }] = useLazyQuery(
    signedUrlParams ? GetSharPrimartComp : GetPrimaryComponent,
    { fetchPolicy: 'network-only' }
  )

  const handleRelationView = async () => {
    await getPrimaryComp({
      variables: {
        projectId: signedUrlParams ? undefined : productId,
        sbomId: sbomId,
        primary: true,
        field,
        direction
      }
    }).then((res) => res?.data && onOpen())
  }

  const onSelectComp = () => {
    prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
    localStorage.setItem('activeSbomTab', 2)
    if (signedUrlParams) {
      setActiveCsSbomTab(2)
    } else {
      setActiveSbomTab(2)
    }
  }

  const onSelectVulns = () => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    localStorage.setItem('activeSbomTab', 3)
    if (signedUrlParams) {
      setActiveCsSbomTab(3)
    } else {
      setActiveSbomTab(3)
      prodVulnDispatch({
        type: 'FILTER_SOURCE',
        payload: sbom?.sbomParts?.length > 0 ? true : false
      })
    }
  }

  const onSelectLicenses = () => {
    localStorage.setItem('activeSbomTab', 4)
    if (signedUrlParams) {
      setActiveCsSbomTab(4)
    } else {
      setActiveSbomTab(4)
    }
  }

  const onSelectPolicy = () => {
    localStorage.setItem('activeSbomTab', 5)
    if (signedUrlParams) {
      setActiveCsSbomTab(5)
    } else {
      setActiveSbomTab(5)
    }
  }

  const onFilterVuln = (value) => {
    const { field, direction, source, retracted } = prodVulnState
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    getVulnData({
      sbomId: sbomId,
      includeRetracted: retracted,
      projectId: signedUrlParams ? undefined : productId,
      source: source === true ? undefined : 'COMPONENT',
      severity: value || undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        if (signedUrlParams) {
          setActiveCsSbomTab(3)
        } else {
          setActiveSbomTab(3)
        }
        prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
        prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
      }
    })
  }

  const handlePart = () => {
    const newData = { ...subProduct }
    if (subProduct?.childFour) {
      delete newData.childFour
      localStorage.setItem('subProduct', JSON.stringify(newData))
    } else if (subProduct?.childThree) {
      delete newData.childThree
      localStorage.setItem('subProduct', JSON.stringify(newData))
    } else if (subProduct?.childTwo) {
      delete newData.childTwo
      localStorage.setItem('subProduct', JSON.stringify(newData))
    } else if (subProduct?.childOne) {
      delete newData.childOne
      localStorage.setItem('subProduct', JSON.stringify(newData))
    } else {
      localStorage.removeItem('subProduct')
    }
  }

  const parentLink = () => {
    if (subProduct?.childFour) {
      const url = getProductVersionDetailPageUrl({
        productgroupid: params.productgroupid,
        productid: subProduct?.childThree?.projectId,
        sbomid: subProduct?.childThree?.sbomId,
        paramsObj: {
          parts: true
        }
      })
      return url
    } else if (subProduct?.childThree) {
      const url = getProductVersionDetailPageUrl({
        productgroupid: params.productgroupid,
        productid: subProduct?.childTwo?.projectId,
        sbomid: subProduct?.childTwo?.sbomId,
        paramsObj: {
          parts: true
        }
      })
      return url
    } else if (subProduct?.childTwo) {
      const url = getProductVersionDetailPageUrl({
        productgroupid: params.productgroupid,
        productid: subProduct?.childOne?.projectId,
        sbomid: subProduct?.childOne?.sbomId,
        paramsObj: {
          parts: true
        }
      })
      return url
    } else if (subProduct?.childOne) {
      const url = getProductVersionDetailPageUrl({
        productgroupid: params.productgroupid,
        productid: subProduct?.projectId,
        sbomid: subProduct?.sbomId,
        paramsObj: {
          parts: true
        }
      })
      return url
    } else {
      const url = getProductVersionDetailPageUrl({
        productgroupid: params.productgroupid,
        productid: id,
        sbomid: currentSBOM?.id,
        paramsObj: {
          parts: true
        }
      })
      return url
    }
  }

  useEffect(() => {
    window.onpopstate = () => {
      console.log(`Pressed back button`)
      handlePart()
    }
  })

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
            {currentProduct && parts && currentSBOM && (
              <Link to={parentLink()} onClick={handlePart}>
                <HStack
                  onClick={() => {
                    localStorage.setItem('activeSbomTab', 1)
                    setActiveSbomTab(1)
                  }}
                >
                  <FaAngleLeft size={18} color='#3182CE' />
                  <Text
                    fontWeight={'semibold'}
                    fontSize={18}
                    color={'blue.500'}
                    textDecor={'underline'}
                  >
                    {subProduct?.childFour
                      ? subProduct?.childThree?.name
                      : subProduct?.childThree
                        ? subProduct?.childTwo?.name
                        : subProduct?.childTwo
                          ? subProduct?.childOne?.name
                          : subProduct?.childOne
                            ? subProduct?.name
                            : name}
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
          {!signedUrlParams && (
            <Flex
              flexDir='row'
              gap={2}
              alignItems={'center'}
              width='100%'
              my={2}
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
          )}
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
