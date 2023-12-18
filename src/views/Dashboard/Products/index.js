// Chakra imports
import { Flex, Text } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import Card from 'components/Card/Card'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import SBOM from 'views/Sbom'
import ProductTable from 'components/Tables/ProductTable'

import { useGlobalState } from 'hooks/useGlobalState'

function Index() {
  const { totalRows, prodState, dispatch } = useGlobalState()
  const { field, direction, enabled } = prodState
  const {
    prodDispatch,
    prodCompDispatch,
    prodVulnDispatch,
    prodCheckDispatch,
    sbomLogDispatch
  } = dispatch

  const { setTotalProducts } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('p')

  const { data, refetch, error } = useQuery(GetProjectData, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  useEffect(() => {
    if (data) {
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

  if (!data && error) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'}>
        <Text textAlign={'center'} fontSize={14}>
          Internal error occured. Please retry in few minutes.
        </Text>
      </Flex>
    )
  } else {
    if (product === null) {
      return (
        <Flex
          flexDirection='column'
          pt={{ base: '120px', md: '74px' }}
          pr={2}
          pl={5}
        >
          <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
            <ProductTable data={data?.projects} refetch={refetch} />
          </Card>
        </Flex>
      )
    } else {
      return <SBOM />
    }
  }
}

export default Index
