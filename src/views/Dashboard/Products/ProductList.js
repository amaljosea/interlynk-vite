import { useTour } from '@reactour/tour'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'
import { productSteps } from 'utils/tourUtils'

import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'

import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetProductTable } from 'graphQL/Queries'

function ProductList() {
  const { dispatch } = useGlobalState()
  const prodTour = localStorage.getItem('productTour')
  const { setIsOpen, setSteps, setCurrentStep } = useTour()
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
    enabled: true
  })

  const { nodes, paginationProps, reset, refetch, loading, error } =
    usePaginatatedQuery(GetProductTable, {
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
    })

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
      !prodTour && localStorage.setItem('productTour', false)
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodTour, prodVulnDispatch, product])

  useEffect(() => {
    if (location.pathname === '/vendor/products' && prodTour === 'false') {
      document?.body?.classList.remove('no-scroll')
      if (nodes?.length > 0) {
        setSteps(productSteps)
        setCurrentStep(0)
        setIsOpen(true)
      }
    }
  }, [location, nodes?.length, prodTour, setCurrentStep, setIsOpen, setSteps])

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
      refetch={refetch}
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
