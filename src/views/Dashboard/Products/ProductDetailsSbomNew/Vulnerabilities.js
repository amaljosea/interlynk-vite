// Chakra imports
import { useMutation, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime, sevColor, timeSince } from 'utils'
import { customStyles } from 'utils'
import { linkURl } from 'utils'
import VexModal from 'views/Dashboard/Vulnerabilities/components/VexModal'
import ImportWizard from 'views/Sbom/components/ImportWizard'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import CvssCard from 'components/Misc/CvssCard'
import Pagination from 'components/Pagination'
import VexStatusComponent from 'components/VulnerabilityVex/VexStatusComponent'

import { useGlobalState } from 'hooks/useGlobalState'

import { ManualVulnScan } from 'graphQL/Mutation'
import {
  FirstDegreePartVulns,
  GetProductData,
  GetVulnData,
  GetVulnFilterData,
  ShareVulnFilters
} from 'graphQL/Queries'

import { FaBug, FaCopy, FaPen } from 'react-icons/fa6'

import VulnFilters from './VulnFilters'

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const ExpandedComponent = ({
  data,
  setActiveRow,
  onCvssOpen,
  textColor,
  filteredData
}) => {
  const { vuln } = data
  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `
  return (
    <Box
      width={'100%'}
      p={5}
      boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
    >
      <Grid
        templateColumns='repeat(5, 1fr)'
        gap={12}
        width={'90%'}
        margin={'0 auto'}
      >
        {/* VULN DATA */}
        <GridItem
          w='100%'
          colSpan={2}
          display={'flex'}
          flexDirection={'column'}
          gap={4}
        >
          {/* Description */}
          <Box>
            <CustomText>Description :</CustomText>
            <Text mt={1} fontSize={14}>
              {vuln.desc}
            </Text>
          </Box>
          {/* Published At  */}
          <Box>
            <CustomText>Published:</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.publishedAt)}
            </Text>
          </Box>
          {/* Last Modified At */}
          <Box>
            <CustomText>Last Modified:</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.lastModifiedAt)}
            </Text>
          </Box>
          {/* CVSS Vector */}
          <Box>
            <CustomText>CVSS Vector :</CustomText>
            {vuln?.cvssVector ? (
              <Tooltip
                bg='gray.50'
                label={<CvssCard value={vuln?.cvssVector} />}
                placement='top'
              >
                <Tag
                  variant='subtle'
                  width={'fit-content'}
                  colorScheme={'cyan'}
                  cursor={'pointer'}
                  onClick={() => {
                    setActiveRow(data)
                    onCvssOpen()
                  }}
                >
                  {vuln?.cvssVector || '-'}
                </Tag>
              </Tooltip>
            ) : (
              <Tag
                variant='subtle'
                width={'fit-content'}
                colorScheme={'cyan'}
                cursor={'pointer'}
              >
                {vuln?.cvssVector || '-'}
              </Tag>
            )}
          </Box>
          {/* NVD ALIAS ID */}
          {vuln.nvdAliasId ? (
            <Box>
              <CustomText>NVD Alias ID:</CustomText>
              <Flex
                width={'fit-content'}
                mt={1}
                direction='row'
                alignItems={'center'}
                gap={2}
              >
                <Link href={linkURl('nvd', vuln.nvdAliasId)} target={'_blank'}>
                  <Icon
                    as={ExternalLinkIcon}
                    h={'16px'}
                    w={'16px'}
                    color={'blue.500'}
                  />
                </Link>
                <Tooltip label={vuln.nvdAliasId} placement={'top'}>
                  <Text width={'fit-content'} fontSize='sm' color={textColor}>
                    {vuln.nvdAliasId}
                  </Text>
                </Tooltip>
              </Flex>
            </Box>
          ) : null}
          {/* EPSS Percentile */}
          <Box>
            <CustomText>EPSS Percentile :</CustomText>
            <Text mt={1} fontSize={14}>
              {vuln?.vulnInfo?.epssPercentile
                ? (vuln?.vulnInfo?.epssPercentile * 100).toFixed()
                : 0}{' '}
              %
            </Text>
          </Box>
        </GridItem>
        {/* STATUS UPDATE */}
        <GridItem w='100%' colSpan={3}>
          {data && (
            <VexStatusComponent data={data} fixedVersions={filteredData} />
          )}
        </GridItem>
      </Grid>
    </Box>
  )
}

const Vulnerabilities = () => {
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { userPermissions, totalRows, setTotalRows, prodVulnState, dispatch } =
    useGlobalState()
  const {
    pageIndex,
    field,
    direction,
    searchInput,
    severities,
    components,
    statues,
    source,
    include,
    kev,
    epss,
    filters,
    direct,
    retracted,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const vulnsPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_feeds'),
    [userPermissions]
  )

  const { data: sbomData, refetch: sbomRefetch } = useQuery(GetProductData, {
    skip: activeTab === 'vulnerabilities' ? false : true,
    variables: { projectId: productId, sbomId }
  })

  useEffect(() => {
    if (sbomData?.sbom?.sbomParts?.length > 0) {
      prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    }
  }, [prodVulnDispatch, sbomData?.sbom?.sbomParts?.length])

  const filteredData = []
  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  // GET VULN DATA
  const { data, refetch, error } = useQuery(GetVulnData, {
    skip:
      sbomId &&
      vulnsPermissions?.value === true &&
      activeTab === 'vulnerabilities'
        ? false
        : true,
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      search: vulnSearch !== '' ? vulnSearch : undefined,
      severity: severities.length > 0 ? severities : undefined,
      source: include.includes('parts') ? undefined : 'COMPONENT',
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === 'direct only' ? true : undefined,
      includeRetracted: include.includes('retracted') ? true : false,
      vexComplete: vexComplete === 'all' ? undefined : false,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  const { vulns } = data?.sbom || ''

  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const firstDegreePart = vulns?.nodes?.filter(
    (item) => item.isFirstDegreePart === true
  )
  const componentVulnIds = firstDegreePart?.map((item) => item?.id)
  const sbomIds = firstDegreePart?.map((item) => item?.component?.sbom?.id)

  useQuery(FirstDegreePartVulns, {
    skip:
      firstDegreePart?.length > 0 &&
      !signedUrlParams &&
      activeTab === 'vulnerabilities'
        ? false
        : true,
    variables: { sbomIds, componentVulnIds },
    onCompleted: (data) => console.log('Parts', data)
  })

  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]

  const textColor = useColorModeValue('gray.700', 'white')
  const [activeRow, setActiveRow] = useState(null)
  const [vulnSearch, setVulnSearch] = useState('')
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const setPaginationControl = useCallback(
    (data) => {
      if (signedUrlParams) {
        setIsPrevActive(
          data?.shareLynkQuery?.sbom?.vulns?.pageInfo?.hasPreviousPage
        )
        setIsNextActive(
          data?.shareLynkQuery?.sbom?.vulns?.pageInfo?.hasNextPage
        )
      } else {
        setIsPrevActive(data?.sbom?.vulns?.pageInfo?.hasPreviousPage)
        setIsNextActive(data?.sbom?.vulns?.pageInfo?.hasNextPage)
      }
    },
    [signedUrlParams]
  )

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  //end

  // GET VULN FILTER HEADS
  useQuery(signedUrlParams ? ShareVulnFilters : GetVulnFilterData, {
    variables: {
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId
    },
    onCompleted: (data) => {
      prodVulnDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: signedUrlParams
          ? data?.shareLynkQuery?.sbom?.filters
          : data?.sbom?.filters
      })
    }
  })

  const [onVulnScan] = useMutation(ManualVulnScan, {
    fetchPolicy: 'network-only'
  })

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const editVulns = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_vulnerabilities' && permission.value === true
  )

  const handleChange = (state) => {
    console.log('state', state)
    setSelectedVulns(state?.selectedRows)
    setSelectedGroup(
      state?.selectedRows[0]?.component?.sbom?.project?.projectGroup?.id
    )
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isCvssOpen,
    onOpen: onCvssOpen,
    onClose: onCvssClose
  } = useDisclosure()
  const {
    isOpen: isTableOpen,
    onOpen: onTableOpen,
    onClose: onTableClose
  } = useDisclosure()

  const cvssColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else {
      return 'gray'
    }
  }

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vuln, isPart, component } = row
        const { sbom } = component
        const { projectVersion, project } = sbom
        const { vulnInfo } = vuln
        const { kev } = vulnInfo ? vulnInfo : ''
        return (
          <Flex direction='row' alignItems={'flex-start'} gap={2} my={3}>
            <Link href={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
            </Link>
            <Stack direction={'column'} spacing={1.5}>
              <Tooltip label={vuln.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor} data-tag='allowRowEvents'>
                  {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
                </Text>
              </Tooltip>
              {isPart && (
                <Text
                  fontSize={'xs'}
                  fontWeight={'medium'}
                  width={'fit-content'}
                >
                  {project?.projectGroup?.name || ''} : {projectVersion || ''}
                </Text>
              )}
              {kev === true && (
                <Badge width={'fit-content'} variant='subtle' colorScheme='red'>
                  KEV
                </Badge>
              )}
            </Stack>
          </Flex>
        )
      },
      width: '280px',
      sortable: true
    },
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Stack
            direction='column'
            alignItems={'flex-start'}
            spacing={1}
            my={3}
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
          >
            <Text>{component?.name || ''}</Text>
            <Text>{component?.version || ''}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '250px',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={'80px'}
            colorScheme={sevColor(vuln?.sev)}
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vuln?.sev || '-'}
            </TagLabel>
          </Tag>
        )
      },
      width: '140px',
      sortable: true,
      wrap: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
      name: 'SOURCE',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            size='sm'
            key='md'
            variant='solid'
            colorScheme={vuln.source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{vuln.source}</TagLabel>
          </Tag>
        )
      },
      width: '120px',
      sortable: true,
      wrap: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => {
        const { vuln } = row
        return (
          <Flex
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            minWidth='max-content'
            alignItems='center'
            gap='2'
          >
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'50px'}
              colorScheme={cvssColor(vuln.cvssScore)}
            >
              <TagLabel mx={'auto'}>
                {vuln.cvssScore ? vuln.cvssScore : '-'}
              </TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '120px',
      sortable: true,
      wrap: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { epssScores } = vulnInfo ? vulnInfo : ''
        return (
          <Flex
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            alignItems='center'
            gap='0'
          >
            <Tooltip
              placement='top'
              label={
                epssScores?.length > 0
                  ? `${(epssScores[0] * 100).toFixed(3)} %`
                  : '-'
              }
            >
              <Tag
                size='md'
                key='md'
                variant='subtle'
                width={'100px'}
                justifyContent='center'
                alignItems='center'
              >
                <TagLabel>
                  {epssScores?.length > 0
                    ? `${(epssScores[0] * 100).toFixed(3)} %`
                    : '-'}
                </TagLabel>
              </Tag>
            </Tooltip>
            {epssScores && epssScores.length > 1 ? (
              epssScores[0] > epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Up from ${(epssScores[epssScores.length - 1] * 100).toFixed(3)} % last week`}
                >
                  <ChevronUpIcon w={5} h={5} color='green.500' />
                </Tooltip>
              ) : epssScores[0] < epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Down from ${(epssScores[epssScores.length - 1] * 100).toFixed(3)} % last week`}
                >
                  <ChevronDownIcon w={5} h={5} color='red.500' />
                </Tooltip>
              ) : null
            ) : null}
          </Flex>
        )
      },
      width: '150px',
      sortable: true,
      wrap: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row.component.version} placement='top'>
          <Text
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            textAlign='right'
            my={2}
          >
            {row.component.version}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      width: '180px',
      sortable: true,
      right: 'true',
      omit: true
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      width: '200px',
      wrap: true,
      sortable: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_VULNS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row.vuln.updatedAt)}
          placement={'top'}
        >
          <Text
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
            width={'150px'}
            textAlign={'right'}
          >
            {timeSince(row.vuln.updatedAt)}
          </Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.vuln.updatedAt)
        const dateB = new Date(b.vuln.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    }
  ]

  const vulnData = useMemo(() => {
    return {
      sbomId: sbomId,
      includeRetracted: retracted,
      projectId: signedUrlParams ? undefined : productId,
      vexComplete: vexComplete === true ? true : undefined,
      search: searchInput !== '' ? searchInput : undefined,
      source: source === true ? undefined : 'COMPONENT',
      severity: severities.length > 0 ? severities : undefined,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss:
        epss !== '' && epss !== 'all'
          ? {
              min: parseFloat(vulnEpss[0]) / 100,
              max: parseFloat(vulnEpss[1]) / 100
            }
          : undefined,
      direct: direct === true ? true : undefined,
      field: field,
      direction: direction
    }
  }, [
    components,
    direct,
    direction,
    epss,
    field,
    kev,
    productId,
    retracted,
    sbomId,
    searchInput,
    severities,
    signedUrlParams,
    source,
    statues,
    vexComplete,
    vulnEpss
  ])

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    disablePaginationControl()
    setVulnSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      source: source === true ? undefined : 'COMPONENT',
      severity: severities.length > 0 ? severities : undefined,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss:
        epss !== '' && epss !== 'all'
          ? {
              min: parseFloat(vulnEpss[0]) / 100,
              max: parseFloat(vulnEpss[1]) / 100
            }
          : undefined,
      direct: direct === true ? true : undefined,
      vexComplete: vexComplete === true ? true : undefined,
      field: field,
      direction: direction,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      }
    })
  }, [
    components,
    direct,
    direction,
    epss,
    field,
    kev,
    prodVulnDispatch,
    productId,
    refetch,
    sbomId,
    setPaginationControl,
    severities,
    source,
    statues,
    totalRows,
    vexComplete,
    vulnEpss
  ])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setVulnSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      disablePaginationControl()
      const { value } = event.target
      if (event.key === 'Enter') {
        await refetch({
          projectId: signedUrlParams ? undefined : productId,
          sbomId: sbomId,
          search: value !== '' ? value : undefined,
          source: source === true ? undefined : 'COMPONENT',
          severity: severities.length > 0 ? severities : undefined,
          componentName: components.length > 0 ? components : undefined,
          status: statues.length > 0 ? statues : undefined,
          kev:
            kev === 'all' || kev === ''
              ? undefined
              : kev === 'yes'
                ? true
                : false,
          epss:
            epss !== '' && epss !== 'all'
              ? {
                  min: parseFloat(vulnEpss[0]) / 100,
                  max: parseFloat(vulnEpss[1]) / 100
                }
              : undefined,
          direct: direct === true ? true : undefined,
          vexComplete: vexComplete === true ? true : undefined,
          first: totalRows,
          last: undefined,
          after: undefined,
          before: undefined,
          field: field,
          direction: direction
        }).then((res) => {
          if (res.data) {
            setPaginationControl(res.data)
            prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
          }
        })
      }
    },
    [
      components,
      direct,
      direction,
      epss,
      field,
      kev,
      prodVulnDispatch,
      productId,
      refetch,
      sbomId,
      setPaginationControl,
      severities,
      signedUrlParams,
      source,
      statues,
      totalRows,
      vexComplete,
      vulnEpss
    ]
  )

  // SCAN VULN
  const handleScan = useCallback(async () => {
    disablePaginationControl()
    await onVulnScan({
      variables: { id: sbomId }
    }).then((res) => {
      if (sbomData?.vulnRunStatus === 'IN_PROGRESS') {
        toast({
          description: 'A scan is in-progress',
          position: 'top',
          status: 'info',
          duration: 5000
        })
      } else {
        if (res.data) {
          toast({
            description: 'Vulnerability re-scan started',
            position: 'top',
            status: 'success',
            duration: 5000
          })
          sbomRefetch({ projectId: productId, sbomId: sbomId }).then(
            (res) => res && setPaginationControl(res?.data)
          )
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      }
    })
  }, [
    onVulnScan,
    prodVulnDispatch,
    productId,
    sbomData?.vulnRunStatus,
    sbomId,
    sbomRefetch,
    setPaginationControl,
    toast
  ])

  const handleRefresh = useCallback(() => {
    disablePaginationControl()
    refetch({ projectId: productId, sbomId: sbomId }).then((res) => {
      res && setPaginationControl(res.data)
    })
  }, [productId, refetch, sbomId, setPaginationControl])

  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'flex-start'}
        justifyContent={'space-between'}
        gap={2}
      >
        <Flex
          flexDirection={'row'}
          alignItems={'flex-start'}
          flexWrap={'wrap'}
          gap={3}
        >
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='vuln'
            filterText={vulnSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filters ? (
            <VulnFilters />
          ) : (
            <Stack direction='row' spacing={4}>
              {[1, 2, 3, 4].map((_, index) => (
                <Skeleton key={index} width={'100px'} height={'38px'} />
              ))}
            </Stack>
          )}
        </Flex>
        <Stack direction='row' alignItems={'center'} width={'fit-content'}>
          {/* UPDATE STATUES */}
          {selectedVulns.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                colorScheme='blue'
                onClick={onOpen}
                hidden={signedUrlParams}
                icon={<FaPen />}
              />
            </Tooltip>
          )}
          {/* SCAN VULN */}
          <Tooltip label={'Scan Vulnerabilities'}>
            <IconButton
              colorScheme='blue'
              onClick={handleScan}
              hidden={signedUrlParams}
              icon={<FaBug />}
            />
          </Tooltip>
          {/* IMPORT STATUS */}
          <Tooltip label='Import Statuses'>
            <IconButton
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              fontSize={'sm'}
              onClick={() => {
                prodVulnDispatch({ type: 'RESET_SELECTED_VULN' })
                onTableOpen()
              }}
              hidden={signedUrlParams}
              isDisabled={!editVulns}
              icon={<FaCopy size={18} />}
            />
          </Tooltip>
          {/* REFRESH */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    editVulns,
    filters,
    handleClear,
    handleRefresh,
    handleScan,
    handleSearch,
    onOpen,
    onSearchInputChange,
    onTableOpen,
    prodVulnDispatch,
    selectedVulns.length,
    signedUrlParams,
    vulnSearch
  ])

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setIsPrevActive(false)
    await refetch({
      ...vulnData,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: vulns.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        prodVulnDispatch({
          type: 'DECREMENT_PAGE',
          payload: vulns.pageInfo.startCursor
        })
      }
    })
  }, [
    vulns?.pageInfo?.startCursor,
    prodVulnDispatch,
    refetch,
    setPaginationControl,
    totalRows,
    vulnData
  ])

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setIsNextActive(false)
    await refetch({
      ...vulnData,
      first: totalRows,
      last: undefined,
      after: vulns.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        prodVulnDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: vulns.totalCount,
            after: vulns?.pageInfo?.endCursor
          }
        })
      }
    })
  }, [
    prodVulnDispatch,
    refetch,
    setPaginationControl,
    totalRows,
    vulnData,
    vulns?.pageInfo?.endCursor,
    vulns?.totalCount
  ])

  const handleSort = (column, sortDirection) => {
    prodVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // SET ROW LENGTH
  const handleSetRow = useCallback(
    async (e) => {
      disablePaginationControl()
      setTotalRows(Number(e.target.value))
      await refetch({
        ...vulnData,
        first: Number(e.target.value),
        last: undefined,
        after: undefined,
        before: undefined
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      })
    },
    [prodVulnDispatch, refetch, setPaginationControl, setTotalRows, vulnData]
  )

  // const handleSelect = (row) => {
  //   const { componentVulnLogs, vexStatus, vexJustification, cdxResponse } = row
  //   const item = componentVulnLogs[componentVulnLogs?.length - 1]
  //   prodVulnDispatch({
  //     type: 'ON_CHANGE_STATUS',
  //     payload: { value: vexStatus?.id || '', name: vexStatus?.name || '' }
  //   })
  //   prodVulnDispatch({
  //     type: 'ON_CHANGE_JUSTIFICATION',
  //     payload: {
  //       value: vexJustification?.id || '',
  //       name: item?.justification || ''
  //     }
  //   })
  //   prodVulnDispatch({
  //     type: 'ON_CHANGE_RESPONSE',
  //     payload: {
  //       value: cdxResponse?.id || '',
  //       name: item?.response ? capitalizeFirstLetter(item?.response) : ''
  //     }
  //   })
  //   prodVulnDispatch({
  //     type: 'SET_ACTION_STMT',
  //     payload: item?.actionStmt || ''
  //   })
  //   prodVulnDispatch({ type: 'SET_SELECTED_TAG', payload: item?.fixedIn || '' })
  //   prodVulnDispatch({ type: 'SET_DETAILS', payload: item?.detail || '' })
  //   prodVulnDispatch({ type: 'SET_NOTES', payload: item?.note || '' })
  //   prodVulnDispatch({ type: 'SET_IMPACT_DATA', payload: item?.impact || '' })
  // }

  // ON SELECT ROW

  useEffect(() => {
    if (vulns) {
      setIsPrevActive(vulns?.pageInfo?.hasPreviousPage)
      setIsNextActive(vulns?.pageInfo?.hasNextPage)
    }
  }, [vulns])

  const handleSelectRow = useCallback(
    (row, bool) => {
      if (!bool) {
        handleRefresh()
      }
    },
    [handleRefresh]
  )

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      {vulnsPermissions?.value === true ? (
        <Flex flexDir={'column'} width={'100%'}>
          {/* TABLE */}
          <DataTable
            className='data-table-container'
            columns={columns}
            data={vulns?.nodes}
            customStyles={customStyles}
            onSort={handleSort}
            defaultSortAsc={false}
            defaultSortFieldId={field}
            progressPending={vulns ? false : true}
            progressComponent={<CustomLoader />}
            subHeader
            subHeaderComponent={subHeader}
            responsive={true}
            expandableRows
            expandOnRowClicked
            persistTableHead
            expandableRowsComponent={ExpandedComponent}
            expandableRowsComponentProps={{
              setActiveRow,
              onCvssOpen,
              textColor,
              filteredData
            }}
            selectableRows={!signedUrlParams}
            clearSelectedRows={toggleClear}
            onSelectedRowsChange={handleChange}
            onRowExpandToggled={(bool, row) => handleSelectRow(row, bool)}
          />
        </Flex>
      ) : (
        <Text mt={4} textAlign={'center'}>
          You do not have permission to access this data
        </Text>
      )}

      {/* PAGINATION */}
      {vulns?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={vulns?.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}

      {/* COPY DATA TABLE */}
      {isTableOpen && vulns && (
        <Drawer
          isOpen={isTableOpen}
          placement='right'
          size='full'
          onClose={onTableClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton
              onClick={() => prodVulnDispatch({ type: 'RESET_IMPORT_SBOMS' })}
            />
            <DrawerHeader>
              <Text fontSize={20} fontWeight={'medium'}>
                Import Vulnerability Status
              </Text>
            </DrawerHeader>
            <DrawerBody mt={2}>
              {/* IMPORT WIZARD */}
              <ImportWizard
                variant='circle'
                currentSbomId={sbomId}
                currentProductId={productId}
                onClose={onTableClose}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {isOpen && selectedVulns.length > 0 && (
        <VexModal
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
          checkEquals={true}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
        />
      )}

      {/* CVSS CARD */}
      {isCvssOpen && (
        <CvssCard
          isOpen={isCvssOpen}
          onClose={onCvssClose}
          value={activeRow?.vuln?.cvssVector}
        />
      )}
    </>
  )
}

export default Vulnerabilities
