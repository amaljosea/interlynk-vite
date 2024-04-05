import { useLazyQuery } from '@apollo/client'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import { GetSignedImages } from 'graphQL/Queries'

import ImageInfo from './components/ImageInfo'
import ImageRow from './components/ImageRow'

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
    const [getImages, { data, refetch }] = useLazyQuery(GetSignedImages)

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
      <Flex
        flexDirection='column'
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
        pt={{ base: '120px', md: '60px' }}
        px={3}
      >
        <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
          <CardBody mt={8}>
            <Table variant='simple' size='sm'>
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
                    <ImageRow key={index} item={item} refetch={refetch} />
                  ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Flex>
    )
  } else {
    return <ImageInfo />
  }
}

export default Images
