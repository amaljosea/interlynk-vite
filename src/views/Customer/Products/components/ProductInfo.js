import { useQuery } from '@apollo/client'
import { Flex, Text } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { GetProductInfo } from 'graphQL/Queries'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ProductInfo = () => {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')
  const signedParams = Cookies.get(`signedParamId`)

  const { data, loading } = useQuery(GetProductInfo, {
    variables: {
      signedParams: signedParams,
      projectId: productId
    }
  })

  useEffect(() => {
    console.log(`Product Info`, data)
  }, [data])

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
        <Card mb='6'>
          <Text>Product Info</Text>
        </Card>
      </Flex>
    </>
  )
}

export default ProductInfo
