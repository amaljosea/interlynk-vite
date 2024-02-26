// Chakra imports
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import {
  Flex,
  Text,
  useDisclosure,
  Tag,
  TagLabel,
  Icon,
  useColorModeValue,
  Link,
  Box,
  Grid,
  GridItem,
  Tooltip,
  Stack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Badge,
  Skeleton,
  useToast,
  Button
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaBug, FaCopy } from 'react-icons/fa6'
import { useState, useMemo, useEffect } from 'react'
import styled from '@emotion/styled'
import ProdStatusDrawer from 'components/Drawer/ProdStatusDrawer'
import VulnFilterMenu from 'views/Sbom/components/VulnFilterMenu'
import { sevColor, timeSince, getFullDateAndTime } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import CustomLoader from 'components/CustomLoader'
import { customStyles } from 'utils'
import ImportWizard from 'views/Sbom/components/ImportWizard'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { GetVulnFilterData } from 'graphQL/Queries'
import { ManualVulnScan } from 'graphQL/Mutation'
import Pagination from '../Pagination'
import { FirstDegreePartVulns } from 'graphQL/Queries'
import { linkURl } from 'utils'
import CvssCard from 'components/Misc/CvssCard'
import { ShareVulnFilters } from 'graphQL/Queries'
import VexModal from 'views/Dashboard/Vulnerabilities/components/VexModal'
import { areArraysEqual } from 'utils'

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'purple'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
  }
}

const VulnTable = ({
  data,
  sbomData,
  refetch,
  productId,
  sbomId,
  filteredData,
  filterRefetch,
  sbomRefetch
}) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const firstDegreePart = data?.nodes?.filter(
    (item) => item.isFirstDegreePart === true
  )
  const componentVulnIds = firstDegreePart?.map((item) => item?.id)
  const sbomIds = firstDegreePart?.map((item) => item?.component?.sbom?.id)

  const { data: parts } = useQuery(FirstDegreePartVulns, {
    skip: firstDegreePart && !signedUrlParams ? false : true,
    variables: { sbomIds, componentVulnIds },
    onCompleted: (data) => console.log('Parts', data)
  })

  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]

  const textColor = useColorModeValue('gray.700', 'white')
  const [vulnSearch, setVulnSearch] = useState('')
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [checkEquals, setCheckEquals] = useState(false)
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const setPaginationControl = (data) => {
    if (signedUrlParams) {
      setIsPrevActive(
        data?.shareLynkQuery?.sbom?.vulns?.pageInfo?.hasPreviousPage
      )
      setIsNextActive(data?.shareLynkQuery?.sbom?.vulns?.pageInfo?.hasNextPage)
    } else {
      setIsPrevActive(data?.sbom?.vulns?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.sbom?.vulns?.pageInfo?.hasNextPage)
    }
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  //end

  const toast = useToast()

  const {
    userPermissions,
    totalRows,
    setTotalRows,
    prodVulnState,
    dispatch
  } = useGlobalState()
  const {
    pageIndex,
    field,
    direction,
    searchInput,
    severities,
    components,
    statues,
    source,
    kev,
    epss,
    filters,
    direct
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  // GET VULN FILTER HEADS
  const {} = useQuery(signedUrlParams ? ShareVulnFilters : GetVulnFilterData, {
    fetchPolicy: 'cache-first',
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
        const {  projectVersion, project } = sbom
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
          <Flex minWidth='max-content' alignItems='center' gap='2'>
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
      name: 'EPSS*',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { epssScores } = vulnInfo ? vulnInfo : ''

        return (
          <Flex minWidth='max-content' alignItems='center' gap='0'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'60px'}
              justifyContent='center'
              alignItems='center'
            >
              <TagLabel style={{ textAlign: 'center' }}>
                {epssScores?.length > 0
                  ? Math.ceil(epssScores[0] * 10000)
                  : '-'}
              </TagLabel>
            </Tag>
            {epssScores && epssScores.length > 1 ? (
              epssScores[0] > epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Up from ${Math.ceil(
                    epssScores[epssScores.length - 1] * 10000
                  )} last week`}
                >
                  <ChevronUpIcon w={5} h={5} color='green.500' />
                </Tooltip>
              ) : epssScores[0] < epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Down from ${Math.ceil(
                    epssScores[epssScores.length - 1] * 10000
                  )} last week`}
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
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component.name} placement='top'>
            <Text textTransform={'capitalize'} my={3}>
              {component.name || ''}
            </Text>
          </Tooltip>
        )
      },
      wrap: true,
      width: '250px',
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row.component.version} placement='top'>
          <Text textAlign='right' my={2}>
            {row.component.version}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      width: '180px',
      sortable: true,
      right: 'true'
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
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
      width: '150px',
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row.vuln.updatedAt)}
          placement={'top'}
        >
          {timeSince(row.vuln.updatedAt)}
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

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 10000,
    max: parseFloat(vulnEpss[1]) / 10000
  }

  const vulnData = {
    projectId: signedUrlParams ? undefined : productId,
    sbomId: sbomId,
    search: searchInput !== '' ? searchInput : undefined,
    source: source === 'BOTH' || source === '' ? undefined : source,
    severity: severities.length > 0 ? severities : undefined,
    componentName: components.length > 0 ? components : undefined,
    status: statues.length > 0 ? statues : undefined,
    kev: kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
    epss: epss !== '' && epss !== 'all' ? range : undefined,
    direct: direct === 'Yes' ? true : false,
    field: field,
    direction: direction
  }

  // CLEAR SERACH
  const handleClear = async () => {
    disablePaginationControl()
    setVulnSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      source: source === 'BOTH' || source === '' ? undefined : source,
      severity: severities.length > 0 ? severities : undefined,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === 'Yes' ? true : false,
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
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setVulnSearch(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    disablePaginationControl()
    const { value } = event.target
    if (event.key === 'Enter') {
      await refetch({
        projectId: signedUrlParams ? undefined : productId,
        sbomId: sbomId,
        search: value !== '' ? value : undefined,
        source: source === 'BOTH' || source === '' ? undefined : source,
        severity: severities.length > 0 ? severities : undefined,
        componentName: components.length > 0 ? components : undefined,
        status: statues.length > 0 ? statues : undefined,
        kev:
          kev === 'all' || kev === ''
            ? undefined
            : kev === 'yes'
              ? true
              : false,
        epss: epss !== '' && epss !== 'all' ? range : undefined,
        direct: direct === 'Yes' ? true : false,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined,
        field: field,
        direction: direction,
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
          prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        }
      })
    }
  }

  // SCAN VULN
  const handleScan = async () => {
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
          sbomRefetch({
            projectId: productId,
            sbomId: sbomId
          }).then((res) => {
            res && setPaginationControl(res?.data)
          })
          prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
        }
      }
    })
  }

  const handleRefresh = async () => {
    disablePaginationControl()
    await refetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) => {
      res && setPaginationControl(res.data)
    })
  }

  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'flex-start'}
        justifyContent={'space-between'}
      >
        <Flex
          flexDirection={'row'}
          alignItems={'flex-start'}
          flexWrap={'wrap'}
          gap={4}
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
            <VulnFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
            />
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
            <Button
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              fontSize={'sm'}
              onClick={onOpen}
              isDisabled={signedUrlParams}
            >
              Set Status
            </Button>
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
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [vulnSearch, filters, onSearchInputChange, handleSearch, handleScan])

  const ExpandedComponent = ({ data }) => {
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
          gap={6}
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
                  <Text mt={1} fontSize={14} cursor={'pointer'}>
                    {vuln?.cvssVector || '-'}
                  </Text>
                </Tooltip>
              ) : (
                <Text mt={1} fontSize={14} cursor={'pointer'}>
                  {vuln?.cvssVector || '-'}
                </Text>
              )}
            </Box>
            {/* NVD ALIAS ID */}
            {vuln.nvdAliasId ? (
              <Box>
                <CustomText>NVD Alias ID:</CustomText>
                <Link href={linkURl('nvd', vuln.nvdAliasId)} target={'_blank'}>
                  <Flex mt={1} direction='row' alignItems={'center'} gap={2}>
                    <Icon
                      as={ExternalLinkIcon}
                      h={'16px'}
                      w={'16px'}
                      color={'blue.500'}
                    />
                    <Tooltip label={vuln.nvdAliasId} placement={'top'}>
                      <Text fontSize='sm' color={textColor}>
                        {vuln.nvdAliasId}
                      </Text>
                    </Tooltip>
                  </Flex>
                </Link>
              </Box>
            ) : null}
            {/* EPSS Percentile */}
            <Box>
              <CustomText>EPSS Percentile :</CustomText>
              <Text mt={1} fontSize={14}>
                {vuln?.vulnInfo?.epssPercentile
                  ? (vuln?.vulnInfo?.epssPercentile * 100).toFixed()
                  : 0}
                %
              </Text>
            </Box>
          </GridItem>
          {/* STATUS UPDATE */}
          <GridItem w='100%' colSpan={3}>
            <ProdStatusDrawer
              data={data}
              textColor={textColor}
              refetch={refetch}
              filteredData={filteredData}
              filterRefetch={filterRefetch}
            />
          </GridItem>
        </Grid>
      </Box>
    )
  }

  const handlePreviousPage = async () => {
    disablePaginationControl()
    setIsPrevActive(false)
    await refetch({
      ...vulnData,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        prodVulnDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
      }
    })
  }

  const handleNextPage = async () => {
    disablePaginationControl()
    setIsNextActive(false)
    await refetch({
      ...vulnData,
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res?.data)
        prodVulnDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: data.totalCount,
            after: data.pageInfo.endCursor
          }
        })
      }
    })
  }

  const handleSort = async (column, sortDirection) => {
    disablePaginationControl()
    refetch({
      projectId: productId,
      sbomId: sbomId,
      signedParams: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      source: source === 'BOTH' || source === '' ? undefined : source,
      severity:
        !severities.includes('all') && severities.length > 0
          ? severities
          : undefined,
      componentName:
        !components.includes('all') && components.length > 0
          ? components
          : undefined,
      status:
        !statues.includes('all') && statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss === 'all' || epss === '0-0' || epss === '' ? undefined : range,
      direct: direct === 'Yes' ? true : false,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
        prodVulnDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
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
  }

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        {/* TABLE */}
        <DataTable
          className='data-table-container'
          columns={columns}
          data={data && data.nodes}
          customStyles={customStyles}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive={true}
          expandableRows
          expandOnRowClicked
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
          selectableRows={!signedUrlParams}
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
        />
      </Flex>

      {/* PAGINATION */}
      {data?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={data?.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}

      {/* EPSS INFO */}
      <Stack
        mt={10}
        direction={'row'}
        spacing={2}
        justifyContent={'flex-end'}
        textAlign={'right'}
      >
        <Link
          href='https://www.first.org/epss/'
          target='_blank'
          fontSize={'xs'}
        >
          * EPSS (Exploit Prediction Scoring System) is an estimation of a
          vulnerability exploit.
          <Text fontSize={'xs'}>
            Interlynk scales EPSS by 10,000 for a more readable score.
          </Text>
        </Link>
      </Stack>

      {/* COPY DATA TABLE */}
      {isTableOpen && data && (
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
    </>
  )
}

export default VulnTable
