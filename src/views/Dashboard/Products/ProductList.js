import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'

import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex, Text } from '@chakra-ui/react'

import ProductTable from 'components/Tables/ProductTable'

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

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const [filters, setFilters] = useState({
    field: 'PROJECT_GROUPS_UPDATED_AT',
    direction: 'DESC',
    enabled: true
  })

  const { nodes, paginationProps, reset, refetch, loading, error } =
    usePaginatatedQuery(GetProductTable, {
      skip: productPermissions?.value === true ? false : true,
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

  if (error) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'}>
        <WarningTwoIcon color='blue.500' />
        <Text textAlign={'center'} fontSize={14}>
          {displayErrorMessage(error.networkError?.statusCode, error.message)}
        </Text>
      </Flex>
    )
  }

  if (productPermissions?.value === false)
    return (
      <Text textAlign={'center'} mt={30}>
        There are no records to display
      </Text>
    )

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
