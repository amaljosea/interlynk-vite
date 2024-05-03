import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, sevColor, timeSince } from 'utils'
import { getProductVulnerabilityDetailPageUrl } from 'utils/url'
import VulnsFilters from 'views/Dashboard/Vulnerabilities/components/VulnsFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import {
  Badge,
  Divider,
  Flex,
  Icon,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Round from 'components/Misc/Round'

import { useGlobalState } from 'hooks/useGlobalState'

import Pagination from '../Pagination'

const GlobalVulnTable = ({ data, refetch }) => {
  //This part is needed for the pagination to work. (Modify with caution)
  const paginationSizes = [25, 50, 100]
  const [totalRows, setTotalRows] = useState(paginationSizes[0])

  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (data) {
      setIsPrevActive(data.pageInfo?.hasPreviousPage)
      setIsNextActive(data.pageInfo?.hasNextPage)
    }
  }, [data])
  //end

  const params = useParams()
  const projectGroupId = params.productgroupid
  const projectId = params.productid
  const path = location?.pathname?.startsWith('/vendor') ? 'vendor' : 'customer'

  const { globalVulnState, dispatch } = useGlobalState()
  const {
    pageIndex,
    field,
    direction,
    searchInput,
    severities,
    products,
    statues,
    kev,
    epss
  } = globalVulnState
  const { globalVulnDispatch } = dispatch

  const [filterText, setFilterText] = useState(searchInput)

  const cvssColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else if (cvss === '') {
      return 'gray'
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

  const epssRange = epss !== 'all' && epss !== '' && epss?.split('-')
  const range = useMemo(() => {
    return {
      min: parseFloat(epssRange[0]) / 100,
      max: parseFloat(epssRange[1]) / 100
    }
  }, [epssRange])

  const vulnData = useMemo(() => {
    return {
      projectGroupIds: products?.length === 0 ? undefined : products,
      severity: severities?.length === 0 ? undefined : severities,
      status: statues?.length === 0 ? undefined : statues,
      kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
      epss: epss === 'all' || epss === '' ? undefined : range
    }
  }, [epss, kev, products, range, severities, statues])

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vulnId, id, vulnInfo, source } = row
        return (
          <Stack spacing={1} my={2}>
            <Flex direction='row' alignItems={'flex-start'} gap={2} my={3}>
              <Link to={linkURl(source, vulnId)} target={'_blank'}>
                <Icon
                  as={ExternalLinkIcon}
                  h={'16px'}
                  w={'16px'}
                  color={'blue.500'}
                />
              </Link>
              <Stack>
                <Link
                  to={
                    params?.productgroupid
                      ? getProductVulnerabilityDetailPageUrl({
                          productgroupid: params.productgroupid,
                          productid: params.productid,
                          vulnerabilityid: id
                        })
                      : `/${path}/vulnerabilities?vulnId=${id}`
                  }
                  onClick={() => localStorage.setItem('activeVuln', vulnId)}
                >
                  <Text fontSize='sm' color={'blue.500'}>
                    {vulnId || ''}
                  </Text>
                </Link>
                {vulnInfo?.kev === true && (
                  <Badge
                    width={'fit-content'}
                    variant='subtle'
                    colorScheme='red'
                  >
                    KEV
                  </Badge>
                )}
              </Stack>
            </Flex>
          </Stack>
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
        const { sev } = row
        return (
          <Tag
            size='md'
            variant='subtle'
            width={'80px'}
            colorScheme={sevColor(sev)}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {sev || '-'}
            </TagLabel>
          </Tag>
        )
      },
      sortable: true,
      width: '10%',
      wrap: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
      name: 'SOURCE',
      selector: (row) => {
        const { source } = row
        return (
          <Tag
            size='sm'
            key='md'
            variant='solid'
            colorScheme={source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{source}</TagLabel>
          </Tag>
        )
      },
      width: '9%',
      wrap: true,
      sortable: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => {
        const { cvssScore } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'50px'}
              colorScheme={cvssColor(cvssScore || '')}
            >
              <TagLabel mx={'auto'}>{cvssScore || '-'}</TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '7%',
      wrap: true,
      sortable: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS',
      selector: (row) => {
        const { vulnInfo } = row
        const { epssScores } = vulnInfo || ''
        return (
          <Flex alignItems='center' gap='0'>
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
      sortable: true,
      width: '12%',
      wrap: true
    },
    // STATUSES
    {
      id: 'STATUSES',
      name: 'STATUSES',
      selector: (row) => {
        const { metrics } = row
        const {
          affectedCount,
          fixedCount,
          inTriageCount,
          notAffectedCount,
          unspecifiedCount
        } = metrics
        return (
          <Stack fontWeight={'medium'} direction={'row'} my={2}>
            <Round bg='gray.200' label='Unspecified'>
              {unspecifiedCount}
            </Round>
            <Round bg='blue.100' label='In Triage'>
              {inTriageCount}
            </Round>
            <Round bg='red.100' label='Affected'>
              {affectedCount}
            </Round>
            <Divider
              orientation='vertical'
              colorScheme={'gray.900'}
              height={10}
            />
            <Round bg='orange.100' label='Fixed'>
              {fixedCount}
            </Round>
            <Round bg='green.100' label='Not Affected'>
              {notAffectedCount}
            </Round>
          </Stack>
        )
      },
      width: '22%',
      wrap: true
    },
    // PUBLISHED AT
    {
      id: 'VULNS_PUBLISHED_AT',
      name: 'PUBLISHED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.publishedAt)} placement={'top'}>
          <Text textAlign={'right'}>{timeSince(row?.publishedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.publishedAt)
        const dateB = new Date(b?.publishedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    },
    // MODIFIED AT
    {
      id: 'VULNS_LAST_MODIFIED_AT',
      name: 'MODIFIED',
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row?.lastModifiedAt)}
          placement={'top'}
        >
          <Text textAlign={'right'}>{timeSince(row?.lastModifiedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.lastModifiedAt)
        const dateB = new Date(b?.lastModifiedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '12%',
      wrap: true,
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && filterText !== '') {
        refetch({
          field,
          direction,
          search: value,
          first: totalRows,
          ...vulnData
        }).then(
          (res) =>
            res?.data &&
            globalVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        )
      }
    },
    [
      direction,
      field,
      filterText,
      globalVulnDispatch,
      refetch,
      totalRows,
      vulnData
    ]
  )

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    await refetch({
      field,
      direction,
      search: undefined,
      first: totalRows,
      ...vulnData
    }).then(
      (res) => res?.data && globalVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }, [direction, field, globalVulnDispatch, refetch, totalRows, vulnData])

  // CLEAR SERACH
  const handleRefresh = useCallback(async () => {
    await refetch({
      field,
      direction,
      first: totalRows,
      projectIds: projectId ? [projectId] : undefined,
      projectGroupIds: projectGroupId ? [projectGroupId] : undefined
    }).then(
      (res) => res?.data && globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
    )
  }, [
    projectGroupId,
    direction,
    field,
    globalVulnDispatch,
    projectId,
    refetch,
    totalRows
  ])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  // HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} gap={3}>
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <SearchFilter
            id='globalVulns'
            filterText={filterText}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          <VulnsFilters refetch={refetch} />
        </Stack>
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={2}
          justifyContent={'flex-end'}
        >
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
    filterText,
    handleSearch,
    handleClear,
    onSearchInputChange,
    refetch,
    handleRefresh
  ])

  // ON PREV PAGE
  const handlePreviousPage = async () => {
    setIsPrevActive(false)
    await refetch({
      field,
      direction,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data?.pageInfo?.startCursor,
      search: searchInput !== '' ? searchInput : undefined,
      ...vulnData
    }).then((res) => {
      if (res.data) {
        const project = res?.data?.organization?.vulns
        globalVulnDispatch({
          type: 'DECREMENT_PAGE',
          payload: project?.pageInfo?.startCursor
        })
        setIsPrevActive(project?.pageInfo?.hasPreviousPage)
      }
    })
  }

  // ON NEXT PAGE
  const handleNextPage = async () => {
    setIsNextActive(false)
    await refetch({
      field,
      direction,
      first: totalRows,
      last: undefined,
      after: data?.pageInfo?.endCursor,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      ...vulnData
    }).then((res) => {
      if (res.data) {
        const project = res?.data?.organization?.vulns
        globalVulnDispatch({
          type: 'INCREMENT_PAGE',
          payload: {
            total: project?.totalCount,
            after: project?.pageInfo?.endCursor
          }
        })
        setIsNextActive(project?.pageInfo?.hasNextPage)
      }
    })
  }

  // ON SET ROW
  const handleSetRow = async (e) => {
    const { value } = e.target
    setTotalRows(Number(value))
    await refetch({
      field,
      direction,
      first: Number(value),
      search: searchInput !== '' ? searchInput : undefined,
      ...vulnData
    }).then(
      (res) => res.data && globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
    )
  }

  // SORTING
  const handleSort = async (column, sortDirection) => {
    await refetch({
      first: totalRows,
      field: column.id,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC',
      search: searchInput !== '' ? searchInput : undefined,
      ...vulnData
    }).then((res) => {
      if (res.data) {
        globalVulnDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
          }
        })
      }
    })
  }

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          keyField='PUBLISHED'
          data={data?.nodes || []}
          onSort={handleSort}
          defaultSortFieldId={field}
          defaultSortAsc={false}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive
          persistTableHead
        />

        {data && (
          <Pagination
            paginationSizes={paginationSizes}
            pageIndex={pageIndex}
            totalRows={totalRows}
            totalCount={data.totalCount}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onSetRow={handleSetRow}
            hasNextPage={isNextActive}
            hasPreviousPage={isPrevActive}
          />
        )}
      </Flex>
    </>
  )
}

export default GlobalVulnTable
