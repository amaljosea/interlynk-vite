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
  Link
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'

import React, { useEffect } from 'react'

import { GetAllImages } from 'graphQL/Queries'

import grype from 'assets/img/grype.png'
import trivy from 'assets/img/trivy.png'
import scout from 'assets/img/scout.png'
import snyk from 'assets/img/snyk.png'
import custom from 'assets/img/custom.png'
import { useQuery } from '@apollo/client'
import { getConImg } from 'utils'

const ProductsOverview = ({ title, amount, captions, data }) => {
  const scanImage = (name) => {
    switch (name) {
      case 'Grype':
        return grype
        break
      case 'Trivy':
        return trivy
        break
      case 'Scout':
        return scout
        break
      case 'Snyk':
        return snyk
        break
      case 'Custom':
        return custom
        break
    }
  }

  const orgID = process.env.REACT_APP_ORGID

  const { data: allImages } = useQuery(GetAllImages, {
    variables: { id: orgID }
  })

  useEffect(() => {
    if (allImages) {
      console.log('allImages', allImages)
    }
  }, [allImages])

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
                  <Th pl={1}>Connection</Th>
                  <Th pl={1}>Tags</Th>
                  <Th pl={1}>Last Pushed</Th>
                  <Th pl={1}>Scanners</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allImages &&
                  allImages.images.map((item) => (
                    <Tr key={item.id}>
                      <Td fontSize={'sm'} pl={1}>
                        <Link
                          href={`#/admin/sboms?p=${item.name}&v=${item.imageVersions[0].name}`}
                          style={{
                            color: '#3182CE',
                            textDecoration: 'underline'
                          }}
                        >
                          {item.name}
                        </Link>
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
                          {item.imageScanners.map((result) => (
                            <Image
                              width={7}
                              objectFit={'contain'}
                              key={result}
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
        </Card>
      </Flex>
    </Flex>
  )
}

export default ProductsOverview
