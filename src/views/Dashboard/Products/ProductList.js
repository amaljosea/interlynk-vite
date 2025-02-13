import { useTour } from '@reactour/tour'
import { useEffect } from 'react'
import { getUndefinedIfEmptyOrAll } from 'utils'
import { displayErrorMessage } from 'utils/errorUtils'

import LynkAlert from 'components/LynkAlert'
import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetProductTable } from 'graphQL/Queries'

function ProductList() {
  const { setIsOpen } = useTour()
  const { dispatch, prodState } = useGlobalState()
  const { prodDispatch, prodCompDispatch, prodVulnDispatch } = dispatch
  const { field, direction, enabled, searchInput, labelIds, lifestage } =
    prodState

  const product = useQueryParam('id')

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const filters = {
    field,
    direction,
    enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
    labelIds: getUndefinedIfEmptyOrAll(labelIds),
    search: searchInput !== '' ? searchInput : undefined,
    lifestage: !lifestage?.includes('none')
      ? getUndefinedIfEmptyOrAll(lifestage)
      : 'none'
  }

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
      <LynkAlert
        msg={displayErrorMessage(error.networkError?.statusCode, error.message)}
      />
    )
  }

  return (
    <ProductTable
      data={nodes}
      reset={reset}
      loading={loading}
      paginationProps={paginationProps}
    />
  )
}

export default ProductList
