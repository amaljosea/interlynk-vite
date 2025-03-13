import { useLazyQuery, useMutation } from '@apollo/client'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { getUndefinedIfEmptyOrAll } from 'utils'
import { customStyles } from 'utils/styleUtils'
import ComponentModal from 'views/Sbom/components/ComponentModal'

import { Flex, Text } from '@chakra-ui/react'
import { useColorMode, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ComponentNotes from 'components/Drawer/ComponentNotes'
import ComponentVulns from 'components/Drawer/ComponentVulns'
import LicenseStatus from 'components/Drawer/LicenseStatus'
import RelationshipDrawer from 'components/Drawer/RelationshipDrawer'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import ComponentAddModal from 'components/Modal/ComponentAddModal'
import Pagination from 'components/Pagination'
import TreeView from 'components/TreeView'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { deleteComSupplier } from 'graphQL/Mutation'
import { GetComponentData, GetComponentPath } from 'graphQL/Queries'

import CompDrawer from '../components/CompDrawer'
import CompInsights from '../components/CompInsights'
import CompSupport from '../components/CompSupport'
import ConfirmationModal from '../components/ConfirmationModal'
import HealthMap from '../components/HealthMap'
import ComponentsColumns from './Components/tableColumns/ComponentsColumns'
import ExpandedComponent from './Components/tableExpanded/ComponentsExpanded'
import ComponentsSubHeader from './Components/tableSubHeaders/ComponentsSubHeader'

const Components = ({ sbomData }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const { colorMode } = useColorMode()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const isArchived = sbomData?.lifecycle === 'archived'

  const { headingTextColor } = useThemeColor(['headingTextColor'])

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
    include,
    selectedComp
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const [activeRow, setActiveRow] = useState(null)
  const [compSearch, setCompSearch] = useState(searchInput || '')

  const compData = useMemo(() => {
    return {
      direct: direct ? true : undefined,
      ecosystem: getUndefinedIfEmptyOrAll(ecosystems),
      kind: getUndefinedIfEmptyOrAll(kinds),
      licenses: getUndefinedIfEmptyOrAll(licenses),
      supplierName: getUndefinedIfEmptyOrAll(suppliers),
      primary: scope === 'primary' ? true : undefined,
      internal: scope === 'internal' ? true : undefined,
      supportLevel: getUndefinedIfEmptyOrAll(supportLevel),
      includeParts: include?.includes('parts') ? true : undefined
    }
  }, [
    direct,
    ecosystems,
    include,
    kinds,
    licenses,
    scope,
    suppliers,
    supportLevel
  ])

  const isSortable = field !== '' && direction !== ''

  // GET COMPONENT DATA
  const { nodes, error, paginationProps, reset, loading } = usePaginatedQuery(
    GetComponentData,
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

  const [activeComp, setActiveComp] = useState(null)

  const updateComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const [getComPath, { data: comPath, loading: comPathLoading }] =
    useLazyQuery(GetComponentPath)

  const MAP = useDisclosure()
  const CPE = useDisclosure()
  const EDIT = useDisclosure()
  const PURL = useDisclosure()
  const GRAPH = useDisclosure()
  const NOTES = useDisclosure()
  const DELETE = useDisclosure()
  const RELATION = useDisclosure()
  const COMPONENT = useDisclosure()
  const INSIGHTS = useDisclosure()
  const VULNS = useDisclosure()
  const SUPPORT = useDisclosure()
  const DELETE_SUPPLIER = useDisclosure()
  const LICENSE_STATUS = useDisclosure()

  const onCreateComponent = useCallback(() => {
    setActiveRow(null)
    COMPONENT.onOpen()
  }, [COMPONENT])

  const onEditOpen = (row) => {
    setActiveRow(row)
    EDIT.onOpen()
  }

  const onDeleteSup = (item) => {
    setActiveRow(item)
    DELETE_SUPPLIER?.onOpen()
  }

  const onRelOpen = (row) => {
    setActiveRow(row)
    getComPath({ variables: { compId: row.id, sbomId: sbomId } })
    RELATION.onOpen()
  }

  const onCheckPurl = (data) => {
    setActiveRow(data)
    PURL.onOpen()
  }

  const onCheckCpe = (data) => {
    setActiveRow(data)
    CPE.onOpen()
  }

  const handleAnalysis = (data) => {
    setActiveRow(data)
    INSIGHTS.onOpen()
  }

  const handleLicenseStatus = (data) => {
    setActiveRow(data)
    LICENSE_STATUS.onOpen()
  }

  const handleNotes = (data) => {
    setActiveRow(data)
    NOTES.onOpen()
  }

  const handleVuln = (row) => {
    setActiveRow(row)
    VULNS.onOpen()
  }

  const handleSupport = (row) => {
    setActiveRow(row)
    SUPPORT.onOpen()
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
      setActiveComp(row)
      GRAPH.onOpen()
    },
    [GRAPH]
  )

  // COLUMNS
  const columns = ComponentsColumns({
    colorMode,
    isFreeTier,
    onCheckCpe,
    sbomId,
    onCheckPurl,
    onEditOpen,
    updateComponent,
    onRelOpen,
    handleGraphView,
    totalComp,
    handleAnalysis,
    handleLicenseStatus,
    handleNotes,
    handleSupport,
    setActiveRow,
    DELETE,
    COMPONENT,
    GRAPH,
    PURL,
    CPE,
    isArchived,
    setActiveComp,
    handleVuln
  })

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
    MAP,
    shouldShowDemoFeatures,
    onCreateComponent,
    restricted,
    signedUrlParams,
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
        <DataTable
          subHeader
          data={nodes}
          expandableRows
          persistTableHead
          responsive={true}
          columns={columns}
          expandOnRowClicked
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={field}
          progressPending={loading}
          onRowClicked={handleRowClick}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          expandableRowsComponent={ExpandedComponent}
          expandableRowExpanded={(row) => expandedRows?.includes(row?.name)}
          expandableRowsComponentProps={{
            isArchived,
            onDeleteSup,
            onCheckPurl,
            onCheckCpe,
            handleGraphView
          }}
        />
      </Flex>

      {/* PAGINATION */}
      <Pagination {...paginationProps} />

      {GRAPH.isOpen && (
        <TreeView
          isOpen={GRAPH.isOpen}
          component={activeComp}
          onClose={GRAPH.onClose}
          isPrimary={activeComp?.primary ? true : false}
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

      {RELATION.isOpen && (
        <RelationshipDrawer
          activeRow={activeRow}
          isOpen={RELATION.isOpen}
          onClose={RELATION.onClose}
          comPathLoading={comPathLoading}
          compPath={comPath?.component?.pathToPrimary}
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
          data={{ id: activeRow?.id, scores: activeRow?.scoreBreakdown }}
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

      {SUPPORT.isOpen && (
        <CompSupport
          data={activeRow}
          isOpen={SUPPORT.isOpen}
          onClose={SUPPORT.onClose}
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
