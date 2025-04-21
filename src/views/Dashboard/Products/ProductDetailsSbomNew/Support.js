import { gql, useQuery } from '@apollo/client'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUndefinedIfEmptyOrAll } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import SupportAnalysis from 'components/Modal/SupportAnalysis'
import SupportStatus from 'components/Modal/SupportStatus'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetCompSupportData } from 'graphQL/Queries'

import CompSupport from '../components/CompSupport'
import SupportColumns from './Components/tableColumns/SupportColumns'
import SupportExpanded from './Components/tableExpanded/SupportExpanded'
import SupportSubHeader from './Components/tableSubHeaders/SupportSubHeader'

export const GetSupportSettings = gql`
  query GetSupportSettings($id: Uuid!) {
    project(id: $id) {
      projectGroup {
        name
      }
      sboms {
        id
        projectVersion
      }
      projectSetting {
        id
        enableSupportLevel
      }
    }
  }
`

const Support = () => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const editComponent = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom_components'
  })

  const { supportState, dispatch } = useGlobalState()
  const { level, include, field, direction, searchInput } = supportState
  const { supportDispatch } = dispatch

  const [activeRow, setActiveRow] = useState(null)
  const [toggleClear, setToggleClear] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [filterText, setFilterText] = useState(searchInput || '')

  const UPDATE_STATUS = useDisclosure()
  const BULK_UPDATE = useDisclosure()
  const ANALYSIS = useDisclosure()

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'rerun_support_analysis':
        return ANALYSIS.onOpen()
      case 'view_support_modal':
        return BULK_UPDATE.onOpen()
      case 'view_support_drawer':
        return UPDATE_STATUS.onOpen()
      default:
        return UPDATE_STATUS.onOpen()
    }
  }

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

  const { data: settings } = useQuery(GetSupportSettings, {
    variables: { id: params?.productid },
    skip: activeTab === 'support' ? false : true
  })
  const { projectGroup, sboms, projectSetting } = settings?.project || {}
  const { enableSupportLevel } = projectSetting || {}

  const activeSbom = sboms?.find((sbom) => sbom?.id === sbomId)

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

  // SUB HEADER
  const subHeader = SupportSubHeader({
    reset,
    action,
    filterText,
    handleSearch,
    handleClear,
    onSearchInputChange,
    selectedItems,
    supportData
  })

  // COLUMNS
  const columns = SupportColumns({ action })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          expandableRows
          columns={columns}
          expandOnRowClicked
          onSort={handleSort}
          progressPending={loading}
          defaultSortFieldId={field}
          subHeaderComponent={subHeader}
          selectableRows={editComponent}
          clearSelectedRows={toggleClear}
          className='data-table-container'
          onSelectedRowsChange={handleChange}
          data={enableSupportLevel ? nodes : []}
          expandableRowsComponent={SupportExpanded}
          selectableRowDisabled={(row) => row?.sbom?.id !== sbomId}
        />

        {/* PAGINATION */}
        {enableSupportLevel && <Pagination {...paginationProps} />}
      </Flex>

      {UPDATE_STATUS.isOpen && (
        <CompSupport
          data={activeRow}
          isOpen={UPDATE_STATUS.isOpen}
          onClose={UPDATE_STATUS.onClose}
          enableSupportLevel={enableSupportLevel}
        />
      )}

      {BULK_UPDATE.isOpen && selectedItems?.length > 0 && (
        <SupportStatus
          isOpen={BULK_UPDATE.isOpen}
          onClose={BULK_UPDATE.onClose}
          selectedItems={selectedItems}
          setToggleClear={setToggleClear}
          setSelectedItems={setSelectedItems}
        />
      )}

      {/* SUPPORT ANALYSIS RUN WARNING */}
      {ANALYSIS.isOpen && (
        <SupportAnalysis
          reset={reset}
          isOpen={ANALYSIS.isOpen}
          onClose={ANALYSIS.onClose}
          enabled={enableSupportLevel}
          data={{
            id: projectSetting?.id,
            group: projectGroup,
            sbom: activeSbom
          }}
        />
      )}
    </>
  )
}

export default Support
