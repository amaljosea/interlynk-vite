// Chakra imports
import { Flex, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import ProductTable from 'components/Tables/ProductTable'
import { useGlobalState } from 'hooks/useGlobalState'
import OrgRegister from '../Profile/components/OrgRegister'
import { displayErrorMessage } from 'utils'
import { WarningTwoIcon } from '@chakra-ui/icons'
import { GetProjectGroups } from 'graphQL/Queries'

function ProductList() {
  const { totalRows, prodState, dispatch } = useGlobalState()
  const { data, field, direction, enabled } = prodState
  const {
    prodDispatch,
    prodCompDispatch,
    prodVulnDispatch,
    prodCheckDispatch,
    sbomLogDispatch
  } = dispatch

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const org = localStorage.getItem('organization')

  const {
    data: groups,
    refetch,
    error
  } = useQuery(GetProjectGroups, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
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

  return (
    <ProductTable
      data={groups?.organization?.projectGroups}
      refetch={refetch}
    />
  )
}

export default ProductList
