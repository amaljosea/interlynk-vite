import { gql } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Flex, Text } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import AttributionReportsColumns from './AttributionReportsColumns'
import AttributionReportsEditModal from './AttributionReportsEditModal'
import AttributionReportsSubHeader from './AttributionReportsSubHeader'

export const GetComponentData = gql`
  query GetComponentData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $internal: Boolean
    $includeParts: Boolean
    $orderBy: ComponentOrderByInput
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(
        sbomId: $sbomId
        after: $after
        before: $before
        first: $first
        last: $last
        search: $search
        internal: $internal
        includeParts: $includeParts

        orderBy: $orderBy
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          enrichedContent {
            packageVersion {
              copyright
              notice
              licenseExp
              license
            }
          }
          id
          sbomId
          sbom {
            projectVersion
            project {
              projectGroup {
                name
              }
            }
          }
          name
          version
          internal
          updatedAt
          copyright
          licensesExp
          notice
          enrichedContent {
            latestPackageVersion {
              copyright
              id
              license
              notice
            }
          }
        }
      }
    }
  }
`

const AttributionReportsDrawer = ({
  isOpen,
  onClose,
  productName,
  productVersion
}) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { prodCompState, dispatch } = useGlobalState()
  const { field, direction, searchInput } = prodCompState
  const { prodCompDispatch } = dispatch

  const [compSearch, setCompSearch] = useState(searchInput || '')
  const [internal, setInternal] = useState(false)
  const [editingRow, setEditingRow] = useState({
    id: null,
    field: null,
    name: '',
    copyright: '',
    license: ''
  })
  const [selectedRowData, setSelectedRowData] = useState([])
  const [sourcePreferences, setSourcePreferences] = useState({})

  const isSortable = field !== '' && direction !== ''

  const getQueryVariables = (includeSearch = false) => {
    return {
      sbomId,
      includeParts: true,
      projectId: productId,
      internal: internal ? !internal : undefined,
      orderBy: includeSearch
        ? isSortable
          ? { field, direction }
          : undefined
        : { field: 'COMPONENTS_NAME', direction: 'ASC' },
      ...(includeSearch && searchInput !== '' && { search: searchInput })
    }
  }

  const { nodes, error, paginationProps, loading, reset } = usePaginatedQuery(
    GetComponentData,
    {
      selector: 'sbom.components',
      variables: getQueryVariables(true),
      onCompleted: (data) => {
        prodCompDispatch({
          type: 'SET_TOTAL_COMP',
          payload: data?.sbom?.components?.totalCount
        })
      }
    }
  )

  const columns = AttributionReportsColumns({
    onEdit: (row, field) => {
      handleEdit(row, field, row.name, row.copyright, row.licensesExp)
    },
    sourcePreferences,
    setSourcePreferences,
    selectedRowData
  })

  const handleRowSelect = (state) => {
    setSelectedRowData(state?.selectedRows)
  }

  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setCompSearch(value)
    }
  }

  const handleClear = useCallback(async () => {
    setCompSearch('')
    prodCompDispatch({ type: 'CLEAR_SEARCH_INPUT' })
    reset()
  }, [prodCompDispatch, reset])

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

  const handleSort = useCallback(
    (column, sortDirection) => {
      if (column?.id && sortDirection) {
        prodCompDispatch({
          type: 'SET_SORT_ORDER',
          payload: {
            field: column.id,
            direction: sortDirection.toUpperCase()
          }
        })
      }
    },
    [prodCompDispatch]
  )

  const handleBulkSourceChange = (source) => {
    if (source === '') return
    const newPreferences = { ...sourcePreferences }
    selectedRowData.forEach((row) => {
      newPreferences[row.id] = source
    })
    setSourcePreferences(newPreferences)
  }

  const subHeader = AttributionReportsSubHeader({
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    setInternal,
    internal,
    query: GetComponentData,
    variables: getQueryVariables(false),
    selectedRowData,
    productName,
    productVersion,
    onBulkSourceChange: handleBulkSourceChange,
    sourcePreferences
  })

  const handleEdit = (row, field) => {
    setEditingRow({
      id: row.id,
      sbomId: row.sbomId,

      field,
      name: row.name,
      copyright: row.copyright,
      license: row.licensesExp,
      notice: row.notice,
      enrichedContent: row.enrichedContent
    })
  }

  const handleEditClose = () => {
    setEditingRow({
      id: null,
      field: null,
      copyright: '',
      license: '',
      notice: '',
      enrichedContent: {}
    })
  }

  const onModalClose = () => {
    handleClear()
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <LynkDrawer
        title='Attribution Reports'
        isOpen={isOpen}
        onClose={onModalClose}
        size='full'
        placement={'bottom'}
        noFooter
      >
        <Box p={4}>
          {error ? (
            <Text>Something went wrong</Text>
          ) : (
            <Flex width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
              <LynkTable
                subHeader
                fixedHeader
                data={nodes}
                selectableRows
                columns={columns}
                onSort={handleSort}
                progressPending={loading}
                subHeaderComponent={subHeader}
                fixedHeaderScrollHeight='60vh'
                className='data-table-container'
                onSelectedRowsChange={handleRowSelect}
              />
            </Flex>
          )}
          <Pagination {...paginationProps} />
        </Box>
      </LynkDrawer>

      <AttributionReportsEditModal
        isOpen={editingRow.id !== null}
        onClose={handleEditClose}
        rowData={editingRow}
        setSelectedRowData={setSelectedRowData}
        sourcePreferences={sourcePreferences}
      />
    </>
  )
}

export default AttributionReportsDrawer
