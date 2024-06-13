import { useLazyQuery, useQuery } from '@apollo/client'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ComponentCard from 'components/Misc/ComponentCard'
import PurlCard from 'components/Misc/PurlCard'
import UserCard from 'components/Misc/UserCard'
import VersionCard from 'components/Misc/VersionCard'
import VulnCard from 'components/Misc/VulnCard'
import Pagination from 'components/Pagination'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import {
  GetChangeLogs,
  GetComponentData,
  GetProductData,
  GetSbomLogFilters,
  GetVulnData
} from 'graphQL/Queries'

import LogFilters from './LogFilters'

const setColor = (type) => {
  switch (type) {
    case 'create':
      return 'green'
    case 'created':
      return 'green'
    case 'update':
      return 'blue'
    case 'updated':
      return 'blue'
    case 'modified':
      return 'pink'
    case 'destroyed':
      return 'red'
    case 'rerun':
      return 'purple'
  }
}

const Changelog = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose
  } = useDisclosure()
  const {
    isOpen: isCardOpen,
    onOpen: onCardOpen,
    onClose: onCardClose
  } = useDisclosure()
  const {
    isOpen: isVCardOpen,
    onOpen: onVCardOpen,
    onClose: onVCardClose
  } = useDisclosure()
  const {
    isOpen: isVulnOpen,
    onOpen: onVulnOpen,
    onClose: onVulnClose
  } = useDisclosure()
  const [activeRow, setActiveRow] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [logState, setLogState] = useState({
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, refetch, loading, reset } =
    usePaginatatedQuery(GetChangeLogs, {
      skip: activeTab === 'changelog' ? false : true,
      selector: 'sbom.activityLogs',
      variables: {
        sbomId: sbomId,
        projectId: productId,
        ...logState,
        search: logState.search || undefined
      }
    })

  const [getComponent] = useLazyQuery(GetComponentData)
  const [getSbom] = useLazyQuery(GetProductData)
  const [getVuln] = useLazyQuery(GetVulnData)

  const onSelect = (row) => {
    const { loggableType, loggablePrefix, updated } = row
    const searchInput = loggablePrefix.split(' ')
    if (loggableType === 'ComponentVuln') {
      getVuln({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: updated,
          field: 'COMPONENT_VULNS_UPDATED_AT',
          direction: 'DESC'
        }
      })
        .then((res) => {
          if (res?.data) {
            const vulns = res?.data?.sbom?.vulns?.nodes
            vulns?.length > 0 && setActiveRow(vulns[0])
          }
        })
        .finally(() => onVulnOpen())
    } else if (loggableType === 'Sbom') {
      getSbom({
        variables: {
          sbomId: sbomId,
          projectId: productId
        }
      })
        .then((res) => res?.data && setActiveRow(res?.data))
        .finally(() => onVCardOpen())
    } else {
      getComponent({
        variables: {
          sbomId: sbomId,
          projectId: productId,
          search: searchInput[0]
        }
      })
        .then((res) => {
          if (res?.data) {
            const components = res?.data?.sbom?.components?.nodes
            components?.length > 0 && setActiveRow(components[0])
          }
        })
        .finally(() => onCardOpen())
    }
  }

  const { field } = paginationProps

  // GET SBOM CHANGELOG FILTER HEADS
  const { data: filters } = useQuery(GetSbomLogFilters, {
    skip: activeTab === 'changelog' ? false : true,
    variables: {
      projectId: productId,
      sbomId
    }
  })

  const { activityLogFilters } = filters?.sbom || ''

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'ACTIVITY_LOGS_ACTION',
      name: 'TYPE',
      selector: (row) => {
        const { action } = row
        return (
          <Tooltip placement='top' label={action} textTransform={'capitalize'}>
            <Tag
              variant='solid'
              colorScheme={setColor(action)}
              textTransform={'capitalize'}
            >
              {action.slice(0, 1)}
            </Tag>
          </Tooltip>
        )
      },
      sortable: true,
      wrap: true,
      width: '8%'
    },
    // CHANGED OBJECT
    {
      id: 'ACTIVITY_LOGS_EVENT',
      name: 'CHANGED',
      selector: (row) => {
        const { event, loggablePrefix, loggableType } = row
        console.log('loggableType', loggableType)
        return (
          <Stack direction={'column'} spacing={0} my={2}>
            <Tag
              fontSize={'sm'}
              overflow={'auto'}
              colorScheme='blue'
              cursor={'pointer'}
              fontWeight={'medium'}
              width={'fit-content'}
              onClick={() => onSelect(row)}
            >
              <TagLabel>
                {loggableType === 'Sbom' ? 'SBOM' : loggablePrefix}
              </TagLabel>
            </Tag>
            <Text>{event}</Text>
          </Stack>
        )
      },
      wrap: true,
      sortable: true
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PREVIOUS VALUE',
      selector: (row) => {
        const { orig, event } = row
        const license =
          (event === 'licenses' || event === 'cpes') && JSON.parse(orig)

        const urls = event === 'external_urls' && JSON.parse(orig)

        if (event === 'purl') {
          return (
            <Text
              my={3}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(orig)
                onOpen()
              }}
            >
              {orig}
            </Text>
          )
        }

        return (
          <Flex flexWrap={'wrap'} gap={2} my={2} whiteSpace={'break-spaces'}>
            <Tooltip
              placement='top'
              label={license ? orig : ''}
              textTransform={'capitalize'}
            >
              <Box textOverflow={'wrap'}>
                {orig === 'f' ? (
                  'False'
                ) : orig === 't' ? (
                  'True'
                ) : license?.length > 0 ? (
                  license.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='red'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>{item}</TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : license?.length === 0 ? (
                  ''
                ) : urls && urls.length > 0 ? (
                  urls.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>
                          {item.name} - {item.url}
                        </TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : (
                  <Text whiteSpace={'wrap'}>{orig}</Text>
                )}
              </Box>
            </Tooltip>
          </Flex>
        )
      },
      wrap: true
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      selector: (row) => {
        const { updated, event } = row
        const updatedValue =
          (event === 'licenses' || event === 'cpes') && JSON.parse(updated)
        const urls = event === 'external_urls' && JSON.parse(updated)

        if (event === 'purl') {
          return (
            <Text
              my={3}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(updated)
                onOpen()
              }}
            >
              {updated}
            </Text>
          )
        }

        return (
          <Flex flexWrap={'wrap'} gap={2} my={2}>
            <Tooltip
              placement='top'
              label={updatedValue ? updated : ''}
              textTransform={'capitalize'}
              whiteSpace={'wrap'}
            >
              <Box>
                {updated === 'f' ? (
                  'False'
                ) : updated === 't' ? (
                  'True'
                ) : updatedValue?.length > 0 ? (
                  updatedValue.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>{item}</TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : updatedValue?.length === 0 ? (
                  ''
                ) : urls && urls.length > 0 ? (
                  urls.map((item, index) => (
                    <Flex
                      key={index}
                      flexWrap={'wrap'}
                      gap={2}
                      my={2}
                      direction={'column'}
                    >
                      <Tag
                        size={'sm'}
                        key={index}
                        variant='subtle'
                        colorScheme='green'
                        width={'fit-content'}
                      >
                        <TagLabel pt={1}>
                          {item.name} - {item.url}
                        </TagLabel>
                      </Tag>
                    </Flex>
                  ))
                ) : (
                  <Text
                    whiteSpace={'wrap'}
                    cursor={'pointer'}
                    onClick={() => onSelect(row)}
                  >
                    {updated}
                  </Text>
                )}
              </Box>
            </Tooltip>
          </Flex>
        )
      },
      wrap: true
    },
    // CHANGED BY
    {
      id: 'ACTIVITY_LOGS_CHANGED_BY',
      name: 'BY',
      selector: (row) => (
        <Tooltip placement='top' label={row.changedBy}>
          <Text
            cursor={'pointer'}
            onClick={() => {
              setActiveRow(row)
              onUserOpen()
            }}
          >
            {row.changedBy}
          </Text>
        </Tooltip>
      ),
      sortable: true,
      width: '12%',
      right: 'true',
      wrap: true
    },
    // CHANGED ON
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'CHANGED',
      selector: (row) => (
        <Box width={'fit-content'}>
          <Tooltip label={getFullDateAndTime(row.updatedAt)} placement={'top'}>
            <Text width={'fit-content'}>{timeSince(row.updatedAt)}</Text>
          </Tooltip>
        </Box>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '10%',
      right: 'true',
      wrap: true
    }
  ]

  const setSearchFilter = useCallback(
    (value) => {
      setLogState((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setLogSearch('')
    setLogState((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setLogSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const handleSort = async (column, sortDirection) => {
    setLogState((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          <SearchFilter
            id='changelog'
            filterText={logSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />
          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          <LogFilters
            filters={activityLogFilters}
            setLogState={(newFilters) => {
              setLogState(newFilters)
              reset()
            }}
          />
        </Stack>
        <Tooltip label='Refresh'>
          <IconButton
            onClick={() => refetch()}
            colorScheme='blue'
            icon={<RepeatIcon />}
          />
        </Tooltip>
      </Flex>
    )
  }, [
    logSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    activityLogFilters,
    reset,
    refetch
  ])

  const rowStyles = [
    {
      when: (row) => row?.copiedFromId !== null,
      style: {
        backgroundColor: '#EDF2F7'
      }
    }
  ]

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} position={'relative'}>
        <DataTable
          columns={columns}
          data={nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          persistTableHead
          subHeaderComponent={subHeaderComponentMemo}
          conditionalRowStyles={rowStyles}
          responsive={true}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <PurlCard value={activeRow} isOpen={isOpen} onClose={onClose} />
      )}

      {isUserOpen && (
        <UserCard
          name={activeRow?.changedBy}
          isOpen={isUserOpen}
          onClose={onUserClose}
        />
      )}

      {isCardOpen && (
        <ComponentCard
          isOpen={isCardOpen}
          onClose={onCardClose}
          data={activeRow}
        />
      )}

      {isVCardOpen && (
        <VersionCard
          isOpen={isVCardOpen}
          onClose={onVCardClose}
          data={activeRow}
        />
      )}

      {isVulnOpen && (
        <VulnCard isOpen={isVulnOpen} onClose={onVulnClose} data={activeRow} />
      )}
    </>
  )
}

export default Changelog
