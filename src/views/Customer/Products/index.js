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
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import ProductRow from './components/ProductRow'
import { useLocation } from 'react-router-dom'
import ProductInfo from './components/ProductInfo'
import { GetSignedProjects } from 'graphQL/Queries'

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

  if (productId === null) {
    const [getAllProjects, { data, loading }] = useLazyQuery(GetSignedProjects)

    useEffect(() => {
      if (data === undefined) {
        getAllProjects({
          variables: {
            signedParams: signedParamId
          }
        })
      }
    }, [])

    useEffect(() => {
      console.log(`data`, data)
    }, [data])

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
              <CardBody mt={8}>
                <Table
                  __css={{ 'tableLayout': 'fixed', width: 'full' }}
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
                      data.projects.length > 0 &&
                      data.projects.map((pv, index) => (
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
