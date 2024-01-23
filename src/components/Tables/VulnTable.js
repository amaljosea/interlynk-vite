// Chakra imports
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon, RepeatIcon
} from '@chakra-ui/icons'
import {
  Flex,
  Text,
  useDisclosure,
  Tag,
  TagLabel,
  Icon,
  useColorModeValue,
  Button,
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
  Skeleton
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaCopy, FaLayerGroup } from 'react-icons/fa6'
import { useState, useMemo, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import ProdStatusDrawer from 'components/Drawer/ProdStatusDrawer'
import VulnFilterMenu from 'views/Sbom/components/VulnFilterMenu'
import { sevColor, timeSince, getFullDateAndTime } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import CustomLoader from 'components/CustomLoader'
import Cookies from 'js-cookie'
import { customStyles } from 'utils'
import RowLimit from 'views/Sbom/components/RowLimit'
import ImportWizard from 'views/Sbom/components/ImportWizard'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GetVulnFilterData } from 'graphQL/Queries'
import Pagination from '../Pagination'
import { ManualVulnScan } from 'graphQL/Mutation'

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
  refetch,
  productId,
  sbomId,
  filteredData,
  filterRefetch
}) => {
  // GET VULN FILTER HEADS
  const [getVulnFilters] = useLazyQuery(GetVulnFilterData)

  const customerView = location.pathname.startsWith('/customer')
  const signedParams = Cookies.get(`signedParamId`)

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
    kev,
    epss,
    filters
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const [onVulnScan] = useMutation(ManualVulnScan)

  const sboms = userPermissions?.find((item) => item.key === 'view_sbom')
  const editVulns = sboms?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_vulnerabilities' && permission.value === true
  )

  const paginationSizes = [25, 50, 100]

  const textColor = useColorModeValue('gray.700', 'white')
  const [vulnSearch, setVulnSearch] = useState('')
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

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
      return 'green'
    }
  }

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
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
        const { vuln } = row
        const { vulnInfo } = vuln
        const { kev } = vulnInfo ? vulnInfo : ''
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            <Link href={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
            </Link>
            <Tooltip label={vuln.vulnId} placement={'top'}>
              <Text
                my={3}
                fontSize='sm'
                color={textColor}
                data-tag='allowRowEvents'
              >
                {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
              </Text>
            </Tooltip>
            {kev === true && (
              <Badge variant='subtle' colorScheme='red'>
                KEV
              </Badge>
            )}
          </Flex>
        )
      },
      width: '15%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <>
            {vuln.sev !== null ? (
              <Tag
                size='md'
                variant='subtle'
                width={'80px'}
                colorScheme={sevColor(`${vuln.sev}`)}
              >
                <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                  {vuln.sev}
                </TagLabel>
              </Tag>
            ) : (
              ''
            )}
          </>
        )
      },
      width: '9%',
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
      width: '9%',
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
                {vuln.cvssScore ? vuln.cvssScore : 0}
              </TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '8%',
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
                {epssScores ? Math.ceil(epssScores[0] * 10000) : 0}
                {/* {epssScores.length > 1 && `- ${epssScores[1]}`} */}
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
      width: '10%',
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
            <Text textTransform={'capitalize'}>
              {component.name !== null
                ? `${component.name?.substring(0, 30)}${
                    component.name.length > 30 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      wrap: true,
      width: '12%',
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row.component.version} placement='top'>
          {row.component.version}
        </Tooltip>
      ),
      wrap: true,
      width: '10%',
      sortable: true
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
      width: '12%',
      wrap: true,
      sortable: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_VULNS_UPDATED_AT',
      name: 'UPDATED AT',
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
    projectId: productId,
    sbomId: sbomId,
    search: searchInput !== '' ? searchInput : undefined,
    severity: severities.length > 0 ? severities : undefined,
    componentName: components.length > 0 ? components : undefined,
    status: statues.length > 0 ? statues : undefined,
    kev: kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
    epss: epss !== '' && epss !== 'all' ? range : undefined,
    field: field,
    direction: direction
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setVulnSearch('')
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      search: undefined,
      severity: severities.length > 0 ? severities : undefined,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      field: field,
      direction: direction,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }).then(
      (res) => res.data && prodVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
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
    const { value } = event.target
    if (event.key === 'Enter') {
      await refetch({
        projectId: productId,
        sbomId: sbomId,
        search: value !== '' ? value : undefined,
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
        field: field,
        direction: direction,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined
      }).then(
        (res) =>
          res.data &&
          prodVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }


  // SCAN VULN
  const handleScan = async () => {
    await onVulnScan({
      variables: { id: sbomId }
    }).then((res) => {
      if (res.data) {
        refetch({
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          search: undefined,
          severity: undefined,
          componentName: undefined,
          status: undefined,
          kev: undefined,
          epss: undefined,
          field: field,
          direction: direction
        })
        prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }
  
  const handleRefresh = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
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
          width={'100%'}
          flexDirection={'row'}
          gap={4}
          alignItems={'flex-start'}
          flexWrap={'wrap'}
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

        <Stack
            direction={'row'}
            spacing={4}
            justifyContent={'flex-end'}>

        {!customerView && (
          <Stack direction='row' spacing={2}>
            {/* SCAN VULN */}
            <Tooltip label='Scan Vulnerabilities'>
              <IconButton
                colorScheme='blue'
                onClick={handleScan}
                icon={<FaLayerGroup />}
              />
            </Tooltip>
            // IMPORT STATUS
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
                isDisabled={!editVulns}
                icon={<FaCopy size={18} />}
              />
            </Tooltip>
          </Stack>
        )}

        <Tooltip label='Refresh'>
          <IconButton
              onClick={handleRefresh}
              colorScheme='blue'
              icon={<RepeatIcon />}>
          </IconButton>
        </Tooltip>

        </Stack>

      </Flex>
    )
  }, [vulnSearch, filters, onSearchInputChange, handleSearch])

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
              <Text mt={1} fontSize={14}>
                {vuln.cvssVector}
              </Text>
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
    setIsPrevActive(false)
    await refetch({
      ...vulnData,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setIsPrevActive(res?.data?.sbom?.vulns?.pageInfo?.hasPreviousPage)
        prodVulnDispatch({
          type: 'DECREMENT_PAGE',
          payload: data.pageInfo.startCursor
        })
      }
    })
  }

  const handleNextPage = async () => {
    setIsNextActive(false)
    await refetch({
      ...vulnData,
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setIsNextActive(res?.data?.sbom?.vulns?.pageInfo?.hasNextPage)
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
    refetch({
      projectId: productId,
      sbomId: sbomId,
      signedParams: customerView ? signedParams : undefined,
      search: searchInput !== '' ? searchInput : undefined,
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
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    }).then((res) => {
      if (res.data) {
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
    setTotalRows(Number(e.target.value))
    await refetch({
      ...vulnData,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res.data) {
        prodVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
      }
    })
  }

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
      getVulnFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          prodVulnDispatch({
            type: 'ADD_FILTER_HEADS',
            payload: res.data.sbom.filters
          })
        }
      })
    }
  }, [data])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} overflowX={'scroll'}>
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
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={pageIndex}
          totalRows={totalRows}
          totalCount={data.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={data.pageInfo.hasNextPage}
          hasPreviousPage={data.pageInfo.hasPreviousPage}
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
    </>
  )
}

export default VulnTable
