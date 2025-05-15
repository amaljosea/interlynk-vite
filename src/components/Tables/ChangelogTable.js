import { useCallback, useMemo, useState } from 'react'
import { getFullDate, timeSince } from 'utils'
import { truncatedValue } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import { getChangelogColor } from 'utils/styleUtils'
import ChangelogFilterMenu from 'views/Sbom/components/ChangelogFilterMenu'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, Tag, Text, Tooltip, useDisclosure } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkTable from 'components/LynkTable'
import UserCard from 'components/Misc/UserCard'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectLogs } from 'graphQL/Queries'

import Pagination from '../Pagination'

const ChangelogTable = ({ activeEnv }) => {
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const [prodLogState, setProdLogState] = useState({
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC'
  })
  const [searchInput, setSearchInput] = useState('')
  const [activeRow, setActiveRow] = useState('')

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose
  } = useDisclosure()

  const tab = useQueryParam('tab')

  const { CHANGE_LOG } = ProductDetailsTabs

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetProjectLogs,
    {
      fetchPolicy: 'network-only',
      skip: tab === CHANGE_LOG ? false : true,
      selector: 'project.activityLogs',
      variables: {
        id: activeEnv,
        ...prodLogState
      }
    }
  )

  const getChangelog = (event) => {
    switch (event) {
      case 'sbom':
        return 'SBOM'
      case 'automation_rule':
        return 'Automation rule'
      case 'jira_project':
        return 'Jira project'
      case 'organization_manufacturer_id':
        return 'Manufacturer ID'
      case 'data_retention_days':
        return 'Data retention'
      case 'flags':
        return 'Flags'
      default:
        return event
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
    }
  }

  // COLUMNS
  const columns = [
    // CHANGE TYPE
    {
      id: 'ACTIVITY_LOGS_CREATED_AT',
      name: 'ACTIVITY',
      selector: (row) => {
        const { action, updatedAt, event } = row
        const eventType = getChangelog(event)
        return (
          <Flex alignItems={'center'} gap={3}>
            <Tooltip
              placement='top'
              label={action}
              textTransform={'capitalize'}
            >
              <Tag
                variant='solid'
                colorScheme={getChangelogColor(action)}
                textTransform={'capitalize'}
              >
                {action.slice(0, 1)}
              </Tag>
            </Tooltip>
            <Flex direction={'column'} alignItems={'start'} gap={1}>
              <Text color={primaryTextColor}>
                {truncatedValue(eventType, 20)}
              </Text>
              <Tooltip label={getFullDate(updatedAt)} placement='top'>
                <Text color={secondaryTextColor} textAlign={'right'}>
                  {timeSince(updatedAt)}
                </Text>
              </Tooltip>
            </Flex>
          </Flex>
        )
      },
      width: '35%',
      sortable: true
    },
    // PRIOR VALUE
    {
      id: 'priorValue',
      name: 'PREVIOUS VALUE',
      wrap: true,
      selector: (row) => {
        const { event, orig } = row
        const content = orig ? `${event} / ${orig}` : ''
        return (
          <Text color={primaryTextColor} my={2}>
            {content || 'N/A'}
          </Text>
        )
      }
    },
    // UPDATED VALUE
    {
      id: 'updatedValue',
      name: 'UPDATED VALUE',
      wrap: true,
      selector: (row) => {
        const { event, updated } = row
        const content = updated ? `${event} / ${updated}` : ''
        return (
          <Text color={primaryTextColor} overflow={'auto'} my={2}>
            {content || 'N/A'}
          </Text>
        )
      }
    },
    // CHANGED BY
    {
      id: 'ACTIVITY_LOGS_CHANGED_BY',
      name: 'BY',
      selector: (row) => (
        <Tooltip placement='top' label={row.changedBy}>
          <Text
            cursor={'pointer'}
            color={primaryTextColor}
            textTransform={'capitalize'}
            onClick={() => {
              setActiveRow(row)
              onUserOpen()
            }}
          >
            {row.changedBy}
          </Text>
        </Tooltip>
      ),
      right: 'true',
      wrap: true,
      sortable: true
    },
    // CHANGED ON
    {
      id: '',
      name: 'CHANGED',
      selector: (row) => (
        <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      width: '12%',
      right: 'true',
      omit: true
    }
  ]

  const setSearchFilter = useCallback(
    (value) => {
      setProdLogState((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setSearchInput('')
    setProdLogState((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

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

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  // SORTING
  const handleSort = (column, sortDirection) => {
    setProdLogState((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex gap={2}>
          <SearchFilter
            id='prodChangelog'
            filterText={searchInput}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />

          <ChangelogFilterMenu
            id={activeEnv}
            setFilter={(newFilters) => {
              setProdLogState(newFilters)
              reset()
            }}
          />
        </Flex>

        <RefreshBtn onClick={() => reset()} />
      </Flex>
    )
  }, [
    searchInput,
    onSearchInputChange,
    handleClear,
    handleSearch,
    activeEnv,
    reset
  ])

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          data={nodes}
          columns={columns}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeader}
          defaultSortFieldId={prodLogState?.field}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {isUserOpen && (
        <UserCard
          name={activeRow?.changedBy}
          isOpen={isUserOpen}
          onClose={onUserClose}
        />
      )}
    </>
  )
}

export default ChangelogTable
