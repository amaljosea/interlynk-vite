// Chakra imports
import { Flex, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import ProductTable from 'components/Tables/ProductTable'
import { useGlobalState } from 'hooks/useGlobalState'
import OrgRegister from '../Profile/components/OrgRegister'

function ProductList() {
  const { totalRows, prodState, dispatch } = useGlobalState()
  const { field, direction, enabled } = prodState
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

  const { data, refetch, error } = useQuery(GetProjectData, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
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

  if (error) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'}>
        <Text textAlign={'center'} fontSize={14}>
          {error.message}
        </Text>
      </Flex>
    )
  }

  if (org === 'undefined') {
    return <OrgRegister />
  }

  return <ProductTable data={data?.projects} refetch={refetch} />
}

export default ProductList
