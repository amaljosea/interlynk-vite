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

import { scanImage, getConImg } from 'utils'
import { useQuery } from '@apollo/client'
import { GetImages } from 'graphQL/Queries'
import { useEffect } from 'react'
import { useState } from 'react'

const ProductsOverview = ({ title }) => {
  const { data, refetch, loading, error } = useQuery(GetImages, {
    variables: {
      first: 10
    }
  })

  const handlePreviousPage = () => {
    refetch({
      last: 10,
      before: data && data.images.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    refetch({
      first: 10,
      after: data && data.images.pageInfo.endCursor,
      before: ''
    })
  }

  return (
    <Flex width={'100%'} direction='column'>
      <Flex
        dir='row'
        width={'100%'}
        alignItems={'center'}
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
                {data &&
                  data.images.nodes.map((item) => (
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
                  ))}
              </Tbody>
            </Table>
          </CardBody>
          {data && (
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
                isDisabled={!data.images.pageInfo.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleNextPage}
                isDisabled={!data.images.pageInfo.hasNextPage}
              >
                Next
              </Button>
            </Flex>
          )}
        </Card>
      </Flex>
    </Flex>
  )
}

export default ProductsOverview
