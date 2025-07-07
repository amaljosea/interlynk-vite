import { useCallback, useState } from 'react'
import DeleteModal from 'views/Dashboard/Support/DeleteModal'
import StatusModal from 'views/Dashboard/Support/StatusModal'
import SupportModal from 'views/Dashboard/Support/SupportModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'
import GlobalSupportColumns from 'components/columns/GlobalSupportColumns'
import GlobalSupportHeader from 'components/headers/GlobalSupportHeader'

const SupportTable = ({
  data,
  loading,
  paginationProps,
  filters,
  setFilters
}) => {
  const { search, field } = filters || {}

  const UPDATE = useDisclosure()
  const STATUS = useDisclosure()
  const DELETE = useDisclosure()
  const CARD = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState(search || '')

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'update_status':
        return STATUS.onOpen()
      case 'view_id':
        return CARD.onOpen()
      case 'update_support':
        return UPDATE.onOpen()
      case 'delete_support':
        return DELETE.onOpen()
      default:
        return UPDATE.onOpen()
    }
  }

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

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
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const handleSort = async (column, sortDirection) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  // COLUMNS
  const columns = GlobalSupportColumns({ action })

  const subHeader = GlobalSupportHeader({
    action,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange
  })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          columns={columns}
          data={data || []}
          onSort={handleSort}
          defaultSortFieldId={field}
          progressPending={loading}
          subHeader
          subHeaderComponent={subHeader}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {UPDATE.isOpen && (
        <SupportModal
          supports={data || []}
          data={activeRow}
          isOpen={UPDATE.isOpen}
          onClose={UPDATE.onClose}
        />
      )}

      {DELETE.isOpen && (
        <DeleteModal
          data={activeRow}
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
        />
      )}

      {STATUS.isOpen && (
        <StatusModal
          data={activeRow}
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
        />
      )}

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
    </>
  )
}

export default SupportTable
