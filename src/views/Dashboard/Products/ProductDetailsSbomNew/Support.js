import { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils'
import DeleteModal from 'views/Dashboard/Support/DeleteModal'
import StatusModal from 'views/Dashboard/Support/StatusModal'
import SupportModal from 'views/Dashboard/Support/SupportModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomSupportTab } from 'graphQL/Queries'

import SupportColumns from './Components/tableColumns/SupportColumns'
import SupportSubHeader from './Components/tableSubHeaders/SupportSubHeader'

const Support = ({ sbomData }) => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isActiveOpen,
    onOpen: onActiveOpen,
    onClose: onActiveClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isCardOpen,
    onOpen: onCardOpen,
    onClose: onCardClose
  } = useDisclosure()

  const [filters, setFilters] = useState({})
  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState('')

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetSbomSupportTab,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.supports',
      variables: {
        sbomId,
        projectId: projectId,
        ...filters
      }
    }
  )

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({
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

  // SUB HEADER
  const subHeader = SupportSubHeader(
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    sbomId,
    onOpen,
    reset,
    setActiveRow
  )

  // COLUMNS
  const columns = SupportColumns(
    isArchived,
    setActiveRow,
    onActiveOpen,
    onCardOpen,
    onOpen,
    onDeleteOpen,
    sbomId
  )

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headingTextColor)}
          defaultSortFieldId={filters.field}
          defaultSortAsc={false}
          progressPending={loading}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          responsive={true}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <SupportModal
          supports={nodes}
          data={activeRow}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}

      {isDeleteOpen && (
        <DeleteModal
          data={activeRow}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}

      {isActiveOpen && (
        <StatusModal
          data={activeRow}
          isOpen={isActiveOpen}
          onClose={onActiveClose}
        />
      )}

      {isCardOpen && activeRow?.idUri?.startsWith('pkg') && (
        <PurlCard
          value={activeRow?.idUri}
          isOpen={isCardOpen}
          onClose={onCardClose}
        />
      )}

      {isCardOpen && activeRow?.idUri?.startsWith('cpe') && (
        <CpeCard
          value={activeRow?.idUri}
          isOpen={isCardOpen}
          onClose={onCardClose}
        />
      )}
    </>
  )
}

export default Support
