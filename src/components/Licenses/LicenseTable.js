import { useCallback, useState } from 'react'

import { Stack, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import GlobalLicenseColumns from 'components/columns/GlobalLicenseColumns'
import GlobalLicenseHeader from 'components/headers/GlobalLicenseHeader'

import { useHasPermission } from 'hooks/useHasPermission'

import Pagination from '../Pagination'
import LicenseModal from './LicenseModal'

const LicenseTable = ({ licenses, paginationProps, setFilters, loading }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateLic = useHasPermission({
    parentKey: 'view_licenses',
    childKey: 'edit_licenses'
  })

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')

  const setSearchFilter = (value) => {
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: value,
      orderBy: undefined
    }))
  }

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined,
      orderBy: undefined
    }))
  }, [setFilters])

  const handleSearch = (event) => {
    const {
      key,
      target: { value }
    } = event
    if (key === 'Enter' && value !== '') {
      setSearchFilter(value.trim())
    }
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      setFilterText(value)
      if (value === '') {
        handleClear()
      }
    },
    [handleClear]
  )

  const handleFilter = (key, value) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      [key]: value[0]
    }))
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'add_license':
        return onOpen()
      case 'edit_license':
        return onOpen()
      default:
        return onOpen()
    }
  }

  // COLUMNS
  const columns = GlobalLicenseColumns({ action })

  // HEADER
  const subHeaderComponent = GlobalLicenseHeader({
    action,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange,
    handleFilter
  })

  const handleSort = async (column, sortDirection) => {
    if (column && column.id && sortDirection) {
      setFilters((oldFilters) => ({
        ...oldFilters,
        orderBy: {
          field: column?.id,
          direction: sortDirection?.toUpperCase()
        }
      }))
    }
  }

  return (
    <>
      <Stack width={'100%'}>
        <LynkTable
          subHeader
          data={licenses}
          columns={columns}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeaderComponent}
          defaultSortFieldId='ORGANIZATION_LICENSES_UPDATED_AT'
        />
        <Pagination {...paginationProps} />
      </Stack>

      {isOpen && (
        <LicenseModal
          isOpen={isOpen}
          data={activeRow}
          onClose={onClose}
          updateLic={updateLic}
        />
      )}
    </>
  )
}

export default LicenseTable
