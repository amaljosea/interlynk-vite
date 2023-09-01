import { useLazyQuery } from '@apollo/client'
import {
  Box,
  Button,
  Flex,
  Table,
  Th,
  Thead,
  Tr,
  Tbody
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { GetSignedProducts } from 'graphQL/Queries'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import ProductRow from './components/ProductRow'
import { useLocation } from 'react-router-dom'
import ProductInfo from './components/ProductInfo'

const Products = () => {
  const signedParamId = Cookies.get('signedParamId')
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')

  const captions = [
    'active',
    'product',
    'versions',
    'description',
    'updated at'
  ]

  console.log(`productId`, productId)

  if (productId === null) {
    const [getProducts, { data, loading }] = useLazyQuery(GetSignedProducts)

    useEffect(() => {
      if (!productId && data === undefined) {
        getProducts({
          variables: {
            signedParams: signedParamId
          }
        })
      }
    }, [])

    return (
      <>
        <Flex
          width={'100%'}
          direction='column'
          mt={{ base: '120px', md: '0px' }}
        >
          <Flex
            flexDirection='column'
            width={'100%'}
            alignItems={'center'}
            px={2}
            justifyContent={'space-between'}
            mt={{ base: '200px', md: '75px' }}
          >
            <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
              <CardHeader>
                <Button size='sm' fontWeight={'medium'} colorScheme='blue'>
                  Refresh
                </Button>
              </CardHeader>
              <CardBody mt={8}>
                <Table
                  __css={{ 'table-layout': 'fixed', width: 'full' }}
                  variant='simple'
                  size='sm'
                >
                  <Thead>
                    <Tr>
                      {captions.map((item, index) => (
                        <Th pl={1} pb={3} key={index}>
                          <Box>{item}</Box>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data &&
                      data.products.length > 0 &&
                      data.products.map((pv, index) => (
                        <ProductRow
                          key={index}
                          id={pv.id}
                          sbomId={pv.sboms}
                          name={pv.name}
                          description={pv.description}
                          updatedAt={pv.updatedAt}
                          allProjects={null}
                          fetchProjects={null}
                          isLoading={loading}
                        />
                      ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </Flex>
        </Flex>
      </>
    )
  } else {
    return <ProductInfo />
  }
}

export default Products
