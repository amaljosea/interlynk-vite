import { gql } from '@apollo/client'
import { useCallback, useState } from 'react'
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
    $licenses: [String!]
    $supplierName: [String!]
    $ecosystem: [String!]
    $supportLevel: [String!]
    $kind: [String!]
    $internal: Boolean
    $primary: Boolean
    $direct: Boolean
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
        licenses: $licenses
        supplierName: $supplierName
        ecosystem: $ecosystem
        kind: $kind
        internal: $internal
        primary: $primary
        direct: $direct
        orderBy: $orderBy
        supportLevel: $supportLevel
        includeParts: $includeParts
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          id
          sbomId
          name
          version
          internal
          updatedAt
          copyright
          licensesExp
          notice
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

  const isSortable = field !== '' && direction !== ''

  const { nodes, error, paginationProps, loading, reset } = usePaginatedQuery(
    GetComponentData,
    {
      selector: 'sbom.components',
      variables: {
        sbomId: sbomId,
        projectId: productId,
        search: searchInput !== '' ? searchInput : undefined,
        orderBy: isSortable ? { field, direction } : undefined,
        internal: internal ? !internal : undefined
      },
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
    }
  })

  const handleRowSelect = (state) => {
    setSelectedRowData(state?.selectedRows)
  }

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

  const subHeader = AttributionReportsSubHeader({
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    setInternal,
    internal,
    query: GetComponentData,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      internal: internal ? !internal : undefined,
      orderBy: isSortable ? { field, direction } : undefined
    },
    selectedRowData,
    productName,
    productVersion
  })

  const handleEdit = (row, field) => {
    setEditingRow({
      id: row.id,
      field,
      name: row.name,
      copyright: row.copyright,
      license: row.licensesExp,
      notice: row.notice
    })
  }

  const handleEditClose = () => {
    setEditingRow({
      id: null,
      field: null,
      copyright: '',
      license: '',
      notice: ''
    })
  }

  const onModalClose = () => {
    handleClear()
    onClose()
  }

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
            <Flex flexDir={'column'} width={'100%'} height={'auto'}>
              <LynkTable
                data={nodes}
                columns={columns}
                selectableRows
                progressPending={loading}
                subHeader
                subHeaderComponent={subHeader}
                onSelectedRowsChange={handleRowSelect}
              />
            </Flex>
          )}
        </Box>
        <Pagination {...paginationProps} />
      </LynkDrawer>

      <AttributionReportsEditModal
        isOpen={editingRow.id !== null}
        onClose={handleEditClose}
        editingField={editingRow?.field}
        rowData={editingRow}
        sbomId={sbomId}
      />
    </>
  )
}

export default AttributionReportsDrawer
