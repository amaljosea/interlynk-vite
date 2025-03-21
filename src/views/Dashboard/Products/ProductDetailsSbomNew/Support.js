import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getUndefinedIfEmptyOrAll } from 'utils'
import { customStyles } from 'utils/styleUtils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import SupportStatus from 'components/Modal/SupportStatus'
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
  const { level, include, field, direction, searchInput } = supportState
  const { supportDispatch } = dispatch

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const CARD = useDisclosure()
  const EDIT = useDisclosure()
  const STATUS = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [filterText, setFilterText] = useState(searchInput || '')

  const isSortable = field !== '' && direction !== ''

  const supportData = useMemo(() => {
    return {
      supportLevel: getUndefinedIfEmptyOrAll(level),
      search: searchInput !== '' ? searchInput : undefined,
      orderBy: isSortable ? { field, direction } : undefined,
      includeParts: include?.includes('parts') ? true : undefined
    }
  }, [direction, field, include, isSortable, level, searchInput])

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompSupportData,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.components',
      variables: {
        ...supportData,
        sbomId: sbomId,
        projectId: projectId
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

  const handleChange = (state) => setSelectedItems(state?.selectedRows)

  const handleSupport = (row) => {
    setActiveRow(row)
    EDIT.onOpen()
  }

  const handleStatus = (row) => {
    setActiveRow(row)
    STATUS.onOpen()
  }

  // SUB HEADER
  const subHeader = SupportSubHeader({
    reset,
    filterText,
    handleSearch,
    handleClear,
    onSearchInputChange,
    handleStatus,
    selectedItems,
    supportData
  })

  // COLUMNS
  const columns = SupportColumns({ handleSupport })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          selectableRows
          expandableRows
          persistTableHead
          responsive={true}
          columns={columns}
          expandOnRowClicked
          onSort={handleSort}
          defaultSortAsc={true}
          data={nodes || []}
          progressPending={loading}
          defaultSortFieldId={field}
          subHeaderComponent={subHeader}
          clearSelectedRows={toggleClear}
          className='data-table-container'
          onSelectedRowsChange={handleChange}
          progressComponent={<CustomLoader />}
          expandableRowsComponent={SupportExpand}
          customStyles={customStyles(headingTextColor)}
          selectableRowDisabled={(row) => row?.sbom?.id !== sbomId}
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

      {STATUS.isOpen && selectedItems?.length > 0 && (
        <SupportStatus
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
          selectedItems={selectedItems}
          setToggleClear={setToggleClear}
          setSelectedItems={setSelectedItems}
        />
      )}
    </>
  )
}

export default Support
