// Chakra imports
import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  Heading,
  Skeleton,
  Button
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'

import React from 'react'
import { Link } from 'react-router-dom'

import { scanImage } from 'utils'
import { useQuery } from '@apollo/client'
import { getConImg } from 'utils'
import { ImagePagination } from 'graphQL/Queries'

const ProductsOverview = ({ title }) => {
  const { data: allImages, refetch } = useQuery(ImagePagination, {
    variables: {
      first: 10
    }
  })

  const handlePreviousPage = () => {
    refetch({
      last: 10,
      before: allImages.images.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    refetch({
      first: 10,
      after: allImages.images.pageInfo.endCursor,
      before: ''
    })
  }

  return (
    <Flex width={'100%'} direction='column' mt={{ base: '120px', md: '0px' }}>
      <Flex
        dir='row'
        width={'100%'}
        alignItems={'center'}
        px={2}
        justifyContent={'space-between'}
      >
        <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
          <CardHeader>
            <Heading fontSize={'xl'}>{title}</Heading>
          </CardHeader>
          <CardBody>
            <Table variant='simple' mt={10}>
              <Thead>
                <Tr>
                  <Th pl={1}>Image</Th>
                  <Th pl={1}>Connector</Th>
                  <Th pl={1}>Tags</Th>
                  <Th pl={1}>Last Pushed</Th>
                  <Th pl={1}>Scanners</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allImages ? (
                  allImages.images.nodes.map((item) => (
                    <Tr key={item.id}>
                      <Td fontSize={'sm'} pl={1}>
                        {item.imageVersions && item.imageVersions.length > 0 ? (
                          <Link
                            to={`/vendor/images?v=${
                              item.imageVersions[item.imageVersions.length - 1]
                                .id
                            }&id=${item.id}`}
                            style={{
                              color: '#3182CE',
                              textDecoration: 'underline'
                            }}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <Text>{item.name}</Text>
                        )}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        <Flex
                          direction={'row'}
                          alignItems={'center'}
                          justifyContent={'start'}
                          gap={2}
                        >
                          <Image
                            width='6'
                            height='6'
                            src={getConImg(
                              item.organizationConnector.connector.name
                            )}
                            alt={`${item.organizationConnector.connector.name}`}
                          />
                          <Text size='sm'>
                            {item.organizationConnector.name.slice(0, 20)}...
                          </Text>
                        </Flex>
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        <Text>{item.imageVersions.length}</Text>
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        <Text>
                          {new Date(item.updatedAt).toISOString().slice(0, 10)}
                        </Text>
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        <Flex direction={'row'} gap={2} alignItems={'center'}>
                          {item.imageScanners.map((result, index) => (
                            <Image
                              width={6}
                              objectFit={'contain'}
                              key={index}
                              src={`${scanImage(result.name)}`}
                              alt={result}
                            />
                          ))}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td fontSize={'sm'} pl={1}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td fontSize={'sm'} pl={1}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td fontSize={'sm'} pl={1}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td fontSize={'sm'} pl={1}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td fontSize={'sm'} pl={1}>
                      <Skeleton height='20px' />
                    </Td>
                  </Tr>
                )}
              </Tbody>
              <Flex
                flexDir={'row'}
                gap={4}
                alignItems={'center'}
                mt={6}
                justifyContent={'flex-start'}
              >
                <Button
                  colorScheme='blue'
                  onClick={handlePreviousPage}
                  isDisabled={
                    allImages && !allImages.images.pageInfo.hasPreviousPage
                  }
                >
                  Previous
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={handleNextPage}
                  isDisabled={
                    allImages && !allImages.images.pageInfo.hasNextPage
                  }
                >
                  Next
                </Button>
              </Flex>
            </Table>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  )
}

export default ProductsOverview
