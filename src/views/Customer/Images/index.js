import { useLazyQuery, useMutation } from '@apollo/client'
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
import { signedImageUpdate } from 'graphQL/Mutation'

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
    'Scanners',
    'Action'
  ]

  if (imageId === null) {
    const [getImages, { data, loading, refetch }] = useLazyQuery(
      GetSignedImages
    )

    useEffect(() => {
      if (!imageId && data === undefined) {
        getImages({
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
                        <ImageRow
                          key={index}
                          item={item}
                          isLoading={loading}
                          refetch={refetch}
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
    return <ImageInfo />
  }
}

export default Images
