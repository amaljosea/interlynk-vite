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
import { GetSignedImages } from 'graphQL/Queries'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import ImageRow from './components/ImageRow'
import { useLocation } from 'react-router-dom'
import ImageInfo from './components/ImageInfo'

const Images = () => {
  const signedParamId = Cookies.get('signedParamId')

  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const imageId = queryParams.get('id')

  const img_captions = [
    'Scan',
    'Image',
    'Connector',
    'Tags',
    'Last Pushed',
    'Scanners'
  ]

  if (imageId === null) {
    const [getImages, { data, loading }] = useLazyQuery(GetSignedImages)

    useEffect(() => {
      if (!imageId && data === undefined) {
        getImages({
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
                      {img_captions.map((item, index) => (
                        <Th pl={1} pb={3} key={index}>
                          <Box>{item}</Box>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data &&
                      data.images.length > 0 &&
                      data.images.map((item, index) => (
                        <ImageRow key={index} item={item} isLoading={loading} />
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
    return <ImageInfo />
  }
}

export default Images
