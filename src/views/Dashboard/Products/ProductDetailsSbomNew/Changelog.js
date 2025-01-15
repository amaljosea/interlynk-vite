import { useQuery } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils/styleUtils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import PurlCard from 'components/Misc/PurlCard'
import UserCard from 'components/Misc/UserCard'
import VersionCard from 'components/Misc/VersionCard'
import VulnCard from 'components/Misc/VulnCard'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetChangeLogs, GetSbomLogFilters } from 'graphQL/Queries'

import ChangelogColumns from './Components/tableColumns/ChangelogColumns'
import ChangelogSubHeader from './Components/tableSubHeaders/ChangeLogSubHeader'

const Changelog = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { headingTextColor, secondaryBgColor } = useThemeColor([
    'headingTextColor',
    'secondaryBgColor'
  ])

  const PURL = useDisclosure()
  const USER = useDisclosure()
  const VULN = useDisclosure()
  const VERSION = useDisclosure()

  const [activeRow, setActiveRow] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [logState, setLogState] = useState({
    field: 'ACTIVITY_LOGS_CREATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetChangeLogs,
    {
      skip: activeTab === 'changelog' ? false : true,
      selector: 'sbom.activityLogs',
      variables: {
        sbomId: sbomId,
        projectId: productId,
        ...logState,
        search: logState.search || undefined
      }
    }
  )

  const onSelect = (row) => {
    const { loggableType, loggablePrefix } = row
    if (!loggableType || !loggablePrefix) {
      return
    }
    const result = loggablePrefix.split(' ')
    if (loggableType === 'ComponentVuln') {
      setSearchInput(result?.length > 0 ? result[0] : '')
      VULN.onOpen()
    } else if (loggableType === 'Sbom') {
      VERSION.onOpen()
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

  const checkUser = (row) => {
    if (row?.changedBy === 'Sharelynk user') {
      return null
    } else {
      setSearchInput(row?.changedBy)
      USER.onOpen()
    }
  }

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

  const rowStyles = [
    {
      when: (row) => row?.copiedFromId !== null,
      style: { backgroundColor: secondaryBgColor }
    }
  ]

  // COLUMNS
  const columns = ChangelogColumns(setActiveRow, onSelect, PURL, checkUser)

  //Subheader
  const subHeader = ChangelogSubHeader(
    logSearch,
    onSearchInputChange,
    handleSearch,
    handleClear,
    activityLogFilters,
    setLogState,
    reset
  )

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} position={'relative'}>
        <DataTable
          columns={columns}
          data={nodes}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          customStyles={customStyles(headingTextColor)}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          persistTableHead
          subHeaderComponent={subHeader}
          conditionalRowStyles={rowStyles}
          responsive={true}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {PURL.isOpen && (
        <PurlCard
          value={activeRow}
          isOpen={PURL.isOpen}
          onClose={PURL.onClose}
        />
      )}

      {USER.isOpen && (
        <UserCard
          name={searchInput}
          isOpen={USER.isOpen}
          onClose={USER.onClose}
        />
      )}

      {VERSION.isOpen && (
        <VersionCard
          isOpen={VERSION.isOpen}
          onClose={VERSION.onClose}
          data={activeRow}
        />
      )}

      {VULN.isOpen && (
        <VulnCard
          isOpen={VULN.isOpen}
          onClose={VULN.onClose}
          value={searchInput}
        />
      )}
    </>
  )
}

export default Changelog
