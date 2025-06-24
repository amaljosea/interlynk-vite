import { useMutation } from '@apollo/client'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUndefinedIfEmptyOrAll } from 'utils'
import { isSbomArchived } from 'utils'
import ComponentModal from 'views/Sbom/components/ComponentModal'

import { Flex, Text } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ComponentNotes from 'components/Drawer/ComponentNotes'
import ComponentVulns from 'components/Drawer/ComponentVulns'
import LicenseStatus from 'components/Drawer/LicenseStatus'
import LynkTable from 'components/LynkTable'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import ComponentAddModal from 'components/Modal/ComponentAddModal'
import Pagination from 'components/Pagination'
import TreeView from 'components/TreeView'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { deleteComSupplier } from 'graphQL/Mutation'
import { GetComponentColumnData } from 'graphQL/Queries'

import CompDrawer from '../components/CompDrawer'
import CompInsights from '../components/CompInsights'
import ConfirmationModal from '../components/ConfirmationModal'
import HealthMap from '../components/HealthMap'
import ComponentsColumns from './Components/tableColumns/ComponentsColumns'
import ExpandedComponent from './Components/tableExpanded/ComponentsExpanded'
import ComponentsSubHeader from './Components/tableSubHeaders/ComponentsSubHeader'

const Components = ({ sbomData }) => {
  const params = useParams()

  const productId = params.productid
  const sbomId = params.sbomid

  const isArchived = isSbomArchived(sbomData)

  const { prodCompState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    searchInput,
    ecosystems,
    supportLevel,
    kinds,
    licenses,
    suppliers,
    scope,
    direct,
    totalComp,
    expandedRows,
    exclude,
    selectedComp
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState(searchInput || '')

  const compData = useMemo(() => {
    const resolveScopeFlag = (scope, key) =>
      scope === key ? true : scope === `exclude_${key}` ? false : undefined
    return {
      direct: direct ? true : undefined,
      ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
      kind: getUndefinedIfEmptyOrAll(kinds),
      licenses: getUndefinedIfEmptyOrAll(licenses),
      supplierName: getUndefinedIfEmptyOrAll(suppliers),
      primary: resolveScopeFlag(scope, 'primary'),
      internal: resolveScopeFlag(scope, 'internal'),
      supportLevel: getUndefinedIfEmptyOrAll(supportLevel),
      includeParts: exclude?.includes('parts') ? undefined : true
    }
  }, [
    direct,
    ecosystems,
    exclude,
    kinds,
    licenses,
    scope,
    suppliers,
    supportLevel
  ])

  const isSortable = field !== '' && direction !== ''

  // GET COMPONENT DATA
  const { nodes, error, paginationProps, reset, loading } = usePaginatedQuery(
    GetComponentColumnData,
    {
      selector: 'sbom.components',
      variables: {
        ...compData,
        sbomId: sbomId,
        projectId: productId,
        orderBy: isSortable ? { field, direction } : undefined,
        search: searchInput !== '' ? searchInput : undefined
      },
      onCompleted: (data) => {
        prodCompDispatch({
          type: 'SET_TOTAL_COMP',
          payload: data?.sbom?.components?.totalCount
        })
      }
    }
  )

  const { lifecycle, primaryComponent } = sbomData || ''

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_sbom_components'
  })

  const MAP = useDisclosure()
  const CPE = useDisclosure()
  const EDIT = useDisclosure()
  const PURL = useDisclosure()
  const GRAPH = useDisclosure()
  const NOTES = useDisclosure()
  const DELETE = useDisclosure()
  const COMPONENT = useDisclosure()
  const INSIGHTS = useDisclosure()
  const VULNS = useDisclosure()
  const DELETE_SUPPLIER = useDisclosure()
  const LICENSE_STATUS = useDisclosure()

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'create_component':
        return COMPONENT.onOpen()
      case 'edit_component':
        return EDIT.onOpen()
      case 'delete_component':
        return DELETE.onOpen()
      case 'delete_component_supplier':
        return DELETE_SUPPLIER.onOpen()
      case 'view_component_relation':
        return GRAPH.onOpen()
      case 'view_purl':
        return PURL.onOpen()
      case 'view_cpe':
        return CPE.onOpen()
      case 'view_insights':
        return INSIGHTS.onOpen()
      case 'edit_license_status':
        return LICENSE_STATUS.onOpen()
      case 'edit_notes':
        return NOTES.onOpen()
      case 'view_component_vulnerabilities':
        return VULNS.onOpen()
      case 'view_health_map':
        return MAP.onOpen()
      default:
        return EDIT.onOpen()
    }
  }

  const handleSort = async (column, sortDirection) => {
    if (column && column.id && sortDirection) {
      prodCompDispatch({
        type: 'SET_SORT_ORDER',
        payload: {
          field: column.id,
          direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
        }
      })
    }
  }

  const handleRowClick = (row) => {
    prodCompDispatch({ type: 'SET_EXPAND', payload: row?.name })
  }

  const handleGraphView = useMemo(
    () => (row) => {
      setActiveRow(row)
      GRAPH.onOpen()
    },
    [GRAPH]
  )

  // COLUMNS
  const columns = ComponentsColumns({ totalComp, isArchived, action })

  const [deleteSupplier, { loading: supLoading }] =
    useMutation(deleteComSupplier)

  const handleSupRemove = async (id) => {
    await deleteSupplier({ variables: { id: id } }).then(() =>
      DELETE_SUPPLIER.onClose()
    )
  }

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

  const debouncedResults = useMemo(() => {
    return debounce(onSearchInputChange, 1000)
  }, [onSearchInputChange])

  useEffect(() => {
    return () => {
      debouncedResults.cancel()
    }
  })

  const restricted = lifecycle === 'signed' || !updateComponent

  // HEADER SECTION
  const subHeader = ComponentsSubHeader({
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    action,
    restricted,
    isArchived,
    compData,
    searchInput,
    field,
    direction,
    reset
  })

  useEffect(() => {
    if (selectedComp) {
      handleGraphView(selectedComp)
    }
  }, [handleGraphView, selectedComp])

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'} height={'auto'}>
        <LynkTable
          subHeader
          data={nodes}
          expandableRows
          columns={columns}
          expandOnRowClicked
          onSort={handleSort}
          progressPending={loading}
          defaultSortFieldId={field}
          onRowClicked={handleRowClick}
          subHeaderComponent={subHeader}
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{ isArchived, action }}
          expandableRowExpanded={(row) => expandedRows?.includes(row?.name)}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {GRAPH.isOpen && activeRow && (
        <TreeView
          isOpen={GRAPH.isOpen}
          component={activeRow}
          onClose={GRAPH.onClose}
        />
      )}

      {COMPONENT.isOpen && (
        <ComponentAddModal
          checkId={null}
          shortDesc={null}
          data={activeRow}
          isOpen={COMPONENT.isOpen}
          onClose={COMPONENT.onClose}
          primaryComp={primaryComponent}
        />
      )}

      {DELETE.isOpen && (
        <ComponentModal
          activeRow={activeRow}
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
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

      {/* SUPPLIER DELETE MODAL */}
      {DELETE_SUPPLIER?.isOpen && (
        <ConfirmationModal
          isLoading={supLoading}
          name={activeRow?.name}
          title={'Remove Supplier'}
          isOpen={DELETE_SUPPLIER?.isOpen}
          onClose={DELETE_SUPPLIER?.onClose}
          onConfirm={() => handleSupRemove(activeRow?.id)}
          description={`You are about to delete the Supplier : ${activeRow?.name} from this component.`}
        />
      )}

      {MAP.isOpen && <HealthMap isOpen={MAP.isOpen} onClose={MAP.onClose} />}

      {EDIT.isOpen && (
        <CompDrawer
          data={activeRow}
          isOpen={EDIT.isOpen}
          onClose={EDIT.onClose}
          primaryComp={primaryComponent}
        />
      )}

      {INSIGHTS.isOpen && (
        <CompInsights
          isOpen={INSIGHTS.isOpen}
          onClose={INSIGHTS.onClose}
          data={{
            id: activeRow?.id,
            sbomId: activeRow?.sbomId,
            scores: activeRow?.scoreBreakdown
          }}
        />
      )}

      {VULNS.isOpen && (
        <ComponentVulns
          data={activeRow}
          isOpen={VULNS.isOpen}
          onClose={VULNS.onClose}
        />
      )}

      {NOTES.isOpen && (
        <ComponentNotes
          data={activeRow}
          isOpen={NOTES.isOpen}
          onClose={NOTES.onClose}
        />
      )}

      {LICENSE_STATUS.isOpen && (
        <LicenseStatus
          data={activeRow}
          isOpen={LICENSE_STATUS.isOpen}
          onClose={LICENSE_STATUS.onClose}
        />
      )}
    </>
  )
}

export default Components
