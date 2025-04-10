import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getUndefinedIfEmptyOrAll } from 'utils'
import ComponentsColumns from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableColumns/ComponentsColumns'
import ExpandedComponent from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/ComponentsExpanded'
import ComponentsSubHeader from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableSubHeaders/ComponentsSubHeader'
import CompDrawer from 'views/Dashboard/Products/components/CompDrawer'

import { Flex, Text, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useDataTableStyles } from 'hooks/useTableStyles'
import { useThemeColor } from 'hooks/useThemeColors'

import { ShareComponentData } from 'graphQL/Queries'

const Components = ({ sbomData }) => {
  const params = useParams()
  const activeTab = useQueryParam('tab')
  const customStyles = useDataTableStyles()

  const sbomId = params.sbomid

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const { prodCompState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    direct,
    include
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const compData = useMemo(() => {
    return {
      ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
      kind: getUndefinedIfEmptyOrAll(kinds),
      licenses: getUndefinedIfEmptyOrAll(licenses),
      supplierName: getUndefinedIfEmptyOrAll(suppliers),
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      direct: direct === true ? true : undefined,
      includeParts: include?.includes('parts') ? true : undefined
    }
  }, [direct, ecosystems, kinds, licenses, scope, include, suppliers])

  const {
    nodes: components,
    error,
    loading,
    reset,
    paginationProps
  } = usePaginatedQuery(ShareComponentData, {
    skip: activeTab !== 'components',
    selector: 'shareLynkQuery.sbom.components',
    variables: {
      sbomId: sbomId,
      search: searchInput !== '' ? searchInput : undefined,
      ...compData,
      field: field,
      direction: direction
    }
  })

  const { primaryComponent } = sbomData || ''

  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState('')

  const DETAILS = useDisclosure()
  const PURL = useDisclosure()
  const CPE = useDisclosure()

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'view_component_details':
        return DETAILS.onOpen()
      case 'view_purl':
        return PURL.onOpen()
      case 'view_cpe':
        return CPE.onOpen()
    }
  }

  // COLUMNS
  const columns = ComponentsColumns({ action })

  // CLEAR SERACH
  const handleClear = useCallback(async () => {
    setCompSearch('')
    prodCompDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [prodCompDispatch, reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setCompSearch(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        prodCompDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    },
    [prodCompDispatch, reset]
  )

  // HEADER SECTION
  const subHeader = ComponentsSubHeader({
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    action,
    compData,
    searchInput,
    field,
    direction,
    reset
  })

  const handleSort = async (column, sortDirection) => {
    prodCompDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  if (error) {
    return (
      <Card>
        <Text color={primaryTextColor}>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} height={'auto'}>
        <DataTable
          columns={columns}
          data={components}
          onSort={handleSort}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          expandableRows
          expandOnRowClicked
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{ action }}
          responsive={true}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {DETAILS.isOpen && (
        <CompDrawer
          data={activeRow}
          isOpen={DETAILS.isOpen}
          onClose={DETAILS.onClose}
          primaryComp={primaryComponent}
        />
      )}

      {PURL.isOpen && (
        <PurlCard
          value={activeRow?.purl}
          isOpen={PURL.isOpen}
          onClose={PURL.onClose}
        />
      )}

      {CPE.isOpen && (
        <CpeCard
          value={activeRow?.cpes[0]}
          isOpen={CPE.isOpen}
          onClose={CPE.onClose}
        />
      )}
    </>
  )
}

export default Components
