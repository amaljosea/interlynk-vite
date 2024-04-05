// Chakra imports
import { useQuery } from '@apollo/client'
import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'

import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex, Text } from '@chakra-ui/react'

import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProductTable } from 'graphQL/Queries'

import OrgRegister from '../Profile/components/OrgRegister'

function ProductList() {
  const { totalRows, prodState, userPermissions, dispatch } = useGlobalState()
  const { data, field, direction, enabled, searchInput } = prodState
  const {
    prodDispatch,
    prodCompDispatch,
    prodVulnDispatch,
    prodCheckDispatch,
    sbomLogDispatch,
    globalVulnDispatch
  } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const org = localStorage.getItem('organization')

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const {
    data: groups,
    refetch,
    error
  } = useQuery(GetProductTable, {
    skip: productPermissions?.value === true ? false : true,
    variables: {
      search: searchInput !== '' ? searchInput : undefined,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      direction: direction,
      first: totalRows,
      field: field
    },
    onCompleted: (data) =>
      prodDispatch({
        type: 'GET_DATA',
        payload: data?.organization?.projectGroups
      })
  })

  useEffect(() => {
    if (data && data.projects && !error) {
      prodDispatch({
        type: 'SET_TOTAL_PRODUCT',
        payload: data.projects.totalCount
      })
    }
  }, [data])

  useEffect(() => {
    if (product === null) {
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
      prodCheckDispatch({ type: 'CLEAR_PROD_CHECK' })
      sbomLogDispatch({ type: 'CLEAR_SBOM_LOG' })
      globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
    }
  }, [product])

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
      data={groups?.organization?.projectGroups}
      refetch={refetch}
    />
  )
}

export default ProductList
