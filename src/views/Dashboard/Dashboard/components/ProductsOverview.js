// Chakra imports
import {
  Button,
  Flex,
  Heading,
  Stack,
  Table,
  TagLabel,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Tag
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'
import VulnBadge from 'components/Misc/VulnBadge'
import React from 'react'
import { Link } from 'react-router-dom'
import { getFullDateAndTime, timeSince, normalizeSBOMVersion } from 'utils'
import { useGlobalState } from 'hooks/useGlobalState'
import { useQuery } from '@apollo/client'
import { GetVulnData } from 'graphQL/Queries'

const ProductsOverview = ({ title, captions, data }) => {
  const { totalRows, setActiveSbomTab, prodVulnState, dispatch } =
    useGlobalState()
  const { field, direction } = prodVulnState
  const { prodDispatch, prodVulnDispatch } = dispatch

  const { refetch } = useQuery(GetVulnData, {
    fetchPolicy: 'network-only',
    skip: true
  })

  const handleClick = (prod) => {
    const { project, id, projectId, primaryComponent } = prod
    const { sboms, name } = project

    const product = {
      id: projectId,
      name: name,
      version: normalizeSBOMVersion(prod),
      sbomId: id
    }

    if (sboms.length > 0) {
      localStorage.setItem('product', JSON.stringify(product))
      localStorage.setItem('activeProdTab', 0)
      prodDispatch({
        type: 'SET_CURRENT_PRODUCT',
        payload: {
          id: projectId,
          sbomId: id
        }
      })
    }
    setActiveSbomTab(0)
  }

  const onVersionClick = (item) => {
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({
        version: normalizeSBOMVersion(item),
        id: item?.id
      })
    )
    localStorage.setItem('activeSbomTab', 0)
    setActiveSbomTab(0)
  }

  const onFilterComp = (item) => {
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({
        version: normalizeSBOMVersion(item),
        id: item.id
      })
    )
    localStorage.setItem('activeSbomTab', 2)
  }

  const onFilterSev = async (id, version, value) => {
    localStorage.setItem(
      'currentSBOM',
      JSON.stringify({ version: version, id: id })
    )
    localStorage.setItem('activeSbomTab', 3)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
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
          <CardHeader pt='12px'>
            <Heading fontSize={'lg'} fontFamily={'inherit'}>
              {title}
            </Heading>
          </CardHeader>
          <CardBody>
            <Table variant='simple' mt={7}>
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
                      {/* NAME */}
                      <Td
                        fontSize={'sm'}
                        pl={1}
                        color='blue.500'
                        _hover={{ textDecoration: 'underline' }}
                      >
                        <Link
                          to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.project?.projectGroup?.id}`}
                          onClick={() => handleClick(item)}
                        >
                          {item?.project?.projectGroup?.name}
                        </Link>
                      </Td>
                      {/* VERSIONS */}
                      <Td
                        fontSize={'sm'}
                        pl={1}
                        width={32}
                        color='blue.500'
                        _hover={{ textDecoration: 'underline' }}
                      >
                        <Link
                          to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                          onClick={() => onVersionClick(item)}
                        >
                          {normalizeSBOMVersion(item)}
                        </Link>
                      </Td>
                      {/* COMPONENTS */}
                      <Td fontSize={'sm'} pl={1} width={10}>
                        <Link
                          to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                          onClick={() => onFilterComp(item)}
                        >
                          <Tag
                            size='md'
                            variant='subtle'
                            width={16}
                            colorScheme={'blue'}
                            cursor={'pointer'}
                          >
                            <TagLabel mx={'auto'}>
                              {item?.stats?.compCount || 0}
                            </TagLabel>
                          </Tag>
                        </Link>
                      </Td>
                      {/* LICENSES */}
                      <Td fontSize={'sm'} pl={1}>
                        <Tag
                          size='md'
                          variant='subtle'
                          width={16}
                          colorScheme={'blue'}
                          cursor={'pointer'}
                        >
                          <TagLabel mx={'auto'}>
                            {item?.stats?.compLicenseCount || 0}
                          </TagLabel>
                        </Tag>
                      </Td>
                      {/* VULNERABILITIES */}
                      <Td fontSize={'sm'} pl={1}>
                        <Stack spacing={1} direction={'row'}>
                          <Link
                            to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                            onClick={() =>
                              onFilterSev(item?.id, normalizeSBOMVersion(item), [
                                'critical'
                              ])
                            }
                          >
                            <VulnBadge color='red' label='Critical'>
                              {item?.stats?.vulnStats?.critical || 0}
                            </VulnBadge>
                          </Link>
                          <Link
                            to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                            onClick={() =>
                              onFilterSev(item?.id, normalizeSBOMVersion(item), [
                                'high'
                              ])
                            }
                          >
                            <VulnBadge color='orange' label='High'>
                              {item?.stats?.vulnStats?.high || 0}
                            </VulnBadge>
                          </Link>
                          <Link
                            to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                            onClick={() =>
                              onFilterSev(item?.id, normalizeSBOMVersion(item), [
                                'medium'
                              ])
                            }
                          >
                            <VulnBadge color='yellow' label='Medium'>
                              {item?.stats?.vulnStats?.medium || 0}
                            </VulnBadge>
                          </Link>
                          <Link
                            to={`/vendor/products/${item?.project?.projectGroup?.name}?id=${item?.projectId}&sbom=${item?.id}`}
                            onClick={() =>
                              onFilterSev(item?.id, normalizeSBOMVersion(item), [
                                'low'
                              ])
                            }
                          >
                            <VulnBadge color='green' label='Low'>
                              {item?.stats?.vulnStats?.low || 0}
                            </VulnBadge>
                          </Link>
                        </Stack>
                      </Td>
                      {/* CREATED AT */}
                      <Td fontSize={'sm'} pl={1}>
                        <Tooltip
                          placement='top'
                          label={getFullDateAndTime(item.createdAt)}
                        >
                          {timeSince(item.createdAt)}
                        </Tooltip>
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
