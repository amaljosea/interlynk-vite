import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import ViewAlert from 'components/Misc/ViewAlert'
import ProductTable from 'components/Tables/ProductTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetProductTable } from 'graphQL/Queries'

import OrgRegister from '../Profile/components/OrgRegister'

function ProductList() {
  const { userPermissions, dispatch } = useGlobalState()
  const { prodDispatch, prodCompDispatch, prodVulnDispatch } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const org = localStorage.getItem('organization')
  const { orgView, orgLoading } = useGlobalQueryContext()

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const [filters, setFilters] = useState({
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    enabled: true
  })

  const { nodes, paginationProps, reset, refetch, loading } =
    usePaginatatedQuery(GetProductTable, {
      skip: !orgView || productPermissions?.value === false,
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
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product])

  if (!org || org === 'undefined') {
    return <OrgRegister />
  }

  if (productPermissions?.value === false || !orgView)
    return <ViewAlert loading={orgLoading} category='products page' />

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
