import { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getUndefinedIfEmptyOrAll } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompSupportData } from 'graphQL/Queries'

import CompSupport from '../components/CompSupport'
import SupportColumns from './Components/tableColumns/SupportColumns'
import SupportExpand from './Components/tableExpanded/SupportExpanded'
import SupportSubHeader from './Components/tableSubHeaders/SupportSubHeader'

const Support = () => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { supportState, dispatch } = useGlobalState()
  const { level, field, direction, searchInput } = supportState
  const { supportDispatch } = dispatch

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const CARD = useDisclosure()
  const EDIT = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState(searchInput || '')

  const isSortable = field !== '' && direction !== ''

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompSupportData,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.components',
      variables: {
        sbomId,
        projectId: projectId,
        supportLevel: getUndefinedIfEmptyOrAll(level),
        search: searchInput !== '' ? searchInput : undefined,
        orderBy: isSortable ? { field, direction } : undefined
      }
    }
  )

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setFilterText('')
    supportDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [supportDispatch, reset])

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

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        supportDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [supportDispatch, reset]
  )

  const handleSort = async (column, sortDirection) => {
    supportDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const handleSupport = (row) => {
    setActiveRow(row)
    EDIT.onOpen()
  }

  // SUB HEADER
  const subHeader = SupportSubHeader({
    reset,
    filterText,
    handleSearch,
    handleClear,
    onSearchInputChange
  })

  // COLUMNS
  const columns = SupportColumns({ handleSupport })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          expandableRows
          persistTableHead
          responsive={true}
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          onSort={handleSort}
          defaultSortAsc={false}
          progressPending={loading}
          defaultSortFieldId={field}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          expandableRowsComponent={SupportExpand}
          customStyles={customStyles(headingTextColor)}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {CARD.isOpen && activeRow?.idUri?.startsWith('pkg') && (
        <PurlCard
          isOpen={CARD.isOpen}
          onClose={CARD.onClose}
          value={activeRow?.idUri}
        />
      )}

      {CARD.isOpen && activeRow?.idUri?.startsWith('cpe') && (
        <CpeCard
          isOpen={CARD.isOpen}
          onClose={CARD.onClose}
          value={activeRow?.idUri}
        />
      )}

      {EDIT.isOpen && (
        <CompSupport
          data={activeRow}
          isOpen={EDIT.isOpen}
          onClose={EDIT.onClose}
        />
      )}
    </>
  )
}

export default Support
