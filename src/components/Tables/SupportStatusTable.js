import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import SupportExpand from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/SupportExpanded'

import { Flex, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import SupportStatus from 'components/Modal/SupportStatus'
import Pagination from 'components/Pagination'
import ProjectSupportColumns from 'components/columns/ProjectSupportColumns'
import ProjectSupportHeader from 'components/headers/ProjectSupportHeader'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetCompSupportData } from 'graphQL/Queries'

const SupportStatusTable = ({
  toggleClear,
  selectedItems,
  setSelectedItems,
  setToggleClear
}) => {
  const params = useParams()
  const projectId = params.productid
  const activeTab = useQueryParam('tab')

  const STATUS = useDisclosure()

  const [searchInput, setSearchInput] = useState('')
  const [supportData, setSupportData] = useState({
    search: '',
    supportLevel: [],
    include: ['parts'],
    orderBy: {
      field: 'COMPONENT_SUPPORT_LEVELS_UPDATED_AT',
      direction: 'DESC'
    }
  })

  const { search, supportLevel, orderBy, include } = supportData || {}

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompSupportData,
    {
      skip: activeTab === 'support status' ? false : true,
      selector: 'componentSupportLevel',
      variables: {
        projectId: projectId,
        search: search !== '' ? search : undefined,
        supportLevel: supportLevel?.length > 0 ? supportLevel : undefined,
        includeParts: include?.includes('parts') ? true : undefined,
        orderBy: orderBy
      }
    }
  )

  // CLEAR SEARCH
  const handleClear = useCallback(async () => {
    setSearchInput('')
    setSupportData((prev) => ({ ...prev, search: '' }))
  }, [])

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

  // SEARCH COMPONENT
  const handleSearch = useCallback(async (event) => {
    const { value } = event.target
    if (event.key === 'Enter') {
      setSupportData((prev) => ({ ...prev, search: value }))
    }
  }, [])

  const handleSelect = (state) => setSelectedItems(state?.selectedRows)

  const handleSort = async (column, sortDirection) => {
    setSupportData((prev) => ({
      ...prev,
      orderBy: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    }))
  }

  const onFilterSupport = (value) => {
    setSupportData((prev) => ({
      ...prev,
      supportLevel: [...value]?.includes('all') ? [] : value
    }))
    reset()
  }

  const onFilterInclude = (value) => {
    setSupportData((prev) => ({
      ...prev,
      include: value || []
    }))
    reset()
  }

  const handleStatus = () => STATUS.onOpen()

  const handleReset = () => {
    setSelectedItems([])
    setToggleClear(true)
    STATUS.onClose()
    reset()
  }

  const columns = ProjectSupportColumns()

  const subHeader = ProjectSupportHeader({
    reset,
    supportData,
    searchInput,
    handleClear,
    handleSearch,
    onSearchInputChange,
    selectedItems,
    onFilterSupport,
    onFilterInclude,
    handleStatus
  })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          expandableRows
          selectableRows
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeader}
          clearSelectedRows={toggleClear}
          className='data-table-container'
          onSelectedRowsChange={handleSelect}
          expandableRowsComponent={SupportExpand}
          defaultSortFieldId={'COMPONENT_SUPPORT_LEVELS_UPDATED_AT'}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {STATUS.isOpen && selectedItems?.length > 0 && (
        <SupportStatus
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
          handleClear={handleReset}
          selectedItems={selectedItems}
          setToggleClear={setToggleClear}
        />
      )}
    </>
  )
}

export default SupportStatusTable
