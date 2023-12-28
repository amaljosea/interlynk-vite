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
  Button,
  Tag,
  Stack
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'

import React from 'react'
import { Link } from 'react-router-dom'

import { scanImage, getConImg } from 'utils'
import { getFullDateAndTime } from 'utils'

const ProductsOverview = ({ title, captions, data }) => {
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
            <Heading fontSize={'xl'} fontFamily={'inherit'}>
              {title}
            </Heading>
          </CardHeader>
          <CardBody>
            <Table variant='simple' mt={10}>
              <Thead>
                <Tr>
                  {captions.map((item, index) => (
                    <Th key={index} pl={1} fontFamily={'inherit'}>
                      {item}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data?.length > 0 &&
                  data?.map((item) => (
                    <Tr key={item.id} fontFamily={'inherit'}>
                      <Td fontSize={'sm'} pl={1}>
                        {item?.name}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        {item?.sboms?.length || 0}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        {item?.sboms[0]?.stats?.compCount || 0}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        {item?.sboms[0]?.stats?.compLicenseCount || 0}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        <Stack spacing={1} direction={'row'}>
                          <Tag variant='subtle' colorScheme='red'>
                            {item?.sboms[0]?.stats?.vulnStats?.critical || 0}
                          </Tag>
                          <Tag variant='subtle' colorScheme='orange'>
                            {item?.sboms[0]?.stats?.vulnStats?.high || 0}
                          </Tag>
                          <Tag variant='subtle' colorScheme='yellow'>
                            {item?.sboms[0]?.stats?.vulnStats?.medium || 0}
                          </Tag>
                          <Tag variant='subtle' colorScheme='green'>
                            {item?.sboms[0]?.stats?.vulnStats?.low || 0}
                          </Tag>
                        </Stack>
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
                        {getFullDateAndTime(item.updatedAt)}
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </CardBody>
          {data && data.images && (
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
