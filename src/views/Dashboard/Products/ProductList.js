import { useTour } from '@reactour/tour'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'

import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'

import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetProductTable } from 'graphQL/Queries'

function ProductList() {
  const { setIsOpen } = useTour()
  const { dispatch } = useGlobalState()
  const { prodDispatch, prodCompDispatch, prodVulnDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const [filters, setFilters] = useState({
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    enabled: true,
    labelIds: []
  })

  const { nodes, paginationProps, reset, loading, error } = usePaginatedQuery(
    GetProductTable,
    {
      skip: productPermissions === false,
      selector: 'organization.projectGroups',
      variables: {
        ...filters
      },
      onCompleted: (data) =>
        prodDispatch({
          type: 'GET_DATA',
          payload: data?.organization?.projectGroups
        })
    }
  )

  useEffect(() => {
    if (nodes) {
      prodDispatch({
        type: 'SET_TOTAL_PRODUCT',
        payload: nodes.totalCount
      })
    }
  }, [nodes, prodDispatch])

  useEffect(() => {
    if (product === null) {
      setIsOpen(false)
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product, setIsOpen])

  if (error) {
    return (
      <Alert mt={32} status='error'>
        <AlertIcon />
        <AlertDescription>
          {displayErrorMessage(error.networkError?.statusCode, error.message)}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ProductTable
      data={nodes}
      loading={loading}
      filters={filters}
      reset={() => reset()}
      paginationProps={paginationProps}
      setFilters={(newFilters) => {
        setFilters(newFilters)
        reset()
      }}
    />
  )
}

export default ProductList
