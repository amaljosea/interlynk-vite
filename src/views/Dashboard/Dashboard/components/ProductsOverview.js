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
                  <Th>Images</Th>
                  <Th>Connection</Th>
                  <Th>Versions</Th>
                  <Th>Scan Result</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allImages &&
                  allImages.images.map((item) => (
                    <Tr key={item.id}>
                      <Td>
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
                      <Td>{item.organizationConnector.name}</Td>
                      <Td>
                        <Flex>
                          {item.imageVersions.map((version, index) => (
                            <Text>
                              {index > 0 && ','}{' '}
                              {/* Render comma for all elements except the first one */}
                              {version.name}
                            </Text>
                          ))}
                        </Flex>
                      </Td>
                      <Td>
                        <Flex direction={'row'} gap={2} alignItems={'center'}>
                          {item.imageScanners.map((result) => (
                            <Image
                              width={8}
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
