// Chakra imports
import { useEffect, useMemo, useState } from 'react'
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Tooltip,
  Stack,
  Button,
  Box,
  Select,
  IconButton
} from '@chakra-ui/react'
import { sevColor, timeSince, getFullDateAndTime, customStyles } from 'utils'
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from '@chakra-ui/icons'
import { Link, useLocation, useParams } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import CustomLoader from 'components/CustomLoader'
import VulnBadge from 'components/Misc/VulnBadge'
import VulnsFilters from 'views/Dashboard/Vulnerabilities/components/VulnsFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import { useGlobalState } from 'hooks/useGlobalState'

const GlobalVulnTable = ({ data, refetch }) => {
  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const groupId = queryParams.get('id')
  const product = JSON.parse(sessionStorage.getItem('product'))

  const { totalRows, setTotalRows, globalVulnState, dispatch } =
    useGlobalState()
  const { pageIndex } = globalVulnState
  const { globalVulnDispatch } = dispatch

  const [filterText, setFilterText] = useState('')
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

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

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vulnId, id } = params?.name ? row?.vuln : row
        return (
          <Link
            to={
              params?.name
                ? `/vendor/products/${product?.name}?id=${product?.id}&vulnId=${id}`
                : `/vendor/vulnerabilities?vulnId=${id}`
            }
            onClick={() => sessionStorage.setItem('activeVuln', vulnId)}
          >
            <Text fontSize='sm' color={'blue.500'}>
              {vulnId || ''}
            </Text>
          </Link>
        )
      },
      width: '15%'
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => {
        const { sev } = params?.name ? row?.vuln : row
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
      width: '9%',
      wrap: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
      name: 'SOURCE',
      selector: (row) => {
        const { source } = params?.name ? row?.vuln : row
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
      width: '8%',
      wrap: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => {
        const { cvssScore } = params?.name ? row?.vuln : row
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
      width: '8%',
      wrap: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS*',
      selector: (row) => {
        const { vulnInfo } = params?.name ? row?.vuln : row
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
            {epssScores?.length > 1 ? (
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
      width: '9%',
      wrap: true
    },
    // STATUSES
    {
      id: 'STATUSES',
      name: 'STATUSES',
      selector: (row) => {
        const { metrics } = params?.name ? row?.vuln : row
        const {
          affectedCount,
          falsePositiveCount,
          fixedCount,
          inTriageCount,
          notAffectedCount,
          unspecifiedCount
        } = metrics

        return (
          <Stack fontWeight={'medium'} direction={'row'}>
            <VulnBadge color='red' label='Affected'>
              {affectedCount || 0}
            </VulnBadge>
            <VulnBadge color='yellow' label='False Positive'>
              {falsePositiveCount || 0}
            </VulnBadge>
            <VulnBadge color='orange' label='Fixed'>
              {fixedCount || 0}
            </VulnBadge>
            <VulnBadge color='blue' label='In Triage'>
              {inTriageCount || 0}
            </VulnBadge>
            <VulnBadge color='green' label='Not Affected'>
              {notAffectedCount || 0}
            </VulnBadge>
            <VulnBadge color='teal' label='Unspecified'>
              {unspecifiedCount || 0}
            </VulnBadge>
          </Stack>
        )
      },
      width: '20%',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'COMPONENT_VULNS_UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          {timeSince(row?.updatedAt)}
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a?.updatedAt)
        const dateB = new Date(b?.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && filterText !== '') {
      refetch({
        search: value,
        first: totalRows,
        last: undefined,
        after: undefined,
        before: undefined
      }).then(
        (res) =>
          res?.data &&
          globalVulnDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      )
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    setFilterText('')
    await refetch({
      search: undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }).then(
      (res) => res?.data && globalVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    )
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

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
              onClick={handleClear}
              colorScheme='blue'
              icon={<RepeatIcon />}
            ></IconButton>
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [filterText, onSearchInputChange, handleClear, handleSearch])

  // ON PREV PAGE
  const handlePreviousPage = async () => {
    setIsPrevActive(false)
    await refetch({
      id: params?.name ? groupId : undefined,
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data?.pageInfo?.startCursor
    }).then((res) => {
      if (res.data) {
        const project = params?.name
          ? res?.data?.projectGroup?.componentVulns
          : res?.data?.organization?.vulns
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
      id: params?.name ? groupId : undefined,
      first: totalRows,
      last: undefined,
      after: data?.pageInfo?.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        const project = params?.name
          ? res?.data?.projectGroup?.componentVulns
          : res?.data?.organization?.vulns
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
      id: params?.name ? groupId : undefined,
      first: Number(value),
      last: undefined,
      after: undefined,
      before: undefined
    }).then((res) => {
      if (res.data) {
        globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
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
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data?.nodes || []}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive
          persistTableHead
        />

        {data && (
          <Flex
            width={'100%'}
            flexDir={'row'}
            gap={4}
            alignItems={'center'}
            mt={6}
            justifyContent={'space-between'}
            flexWrap={'wrap'}
          >
            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Button
                colorScheme='blue'
                onClick={handlePreviousPage}
                isDisabled={!isPrevActive}
              >
                Prev
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleNextPage}
                isDisabled={!isNextActive}
              >
                Next
              </Button>
              <Box>
                Page {pageIndex} of{' '}
                {data.totalCount === 0
                  ? 1
                  : Math.ceil(data.totalCount / totalRows)}
              </Box>
            </Stack>

            <Stack alignItems={'center'} direction={'row'} spacing={4}>
              <Text>Show</Text>
              <Select
                width={20}
                value={totalRows}
                onChange={handleSetRow}
                id='rowlimit'
                name='rowlimit'
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </Stack>
          </Flex>
        )}
      </Flex>
    </>
  )
}

export default GlobalVulnTable
