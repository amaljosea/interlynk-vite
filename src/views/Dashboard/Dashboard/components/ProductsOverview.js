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

import { scanImage, getConImg } from 'utils'
import { getFullDateAndTime, timeSince } from 'utils'

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
                      <Td fontSize={'sm'} pl={1}>
                        {item?.project?.name}
                      </Td>
                      <Td fontSize={'sm'} pl={1} width={24}>
                        {item?.primaryComponent?.version ||
                          `Uploaded ${getFullDateAndTime(item?.createdAt)}`}
                      </Td>
                      <Td fontSize={'sm'} pl={1}>
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
                      </Td>
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
                      <Td fontSize={'sm'} pl={1}>
                        <Stack spacing={1} direction={'row'}>
                          <Link to={'https://google.com'}>
                            <VulnBadge
                              color='red'
                              label='Critical'
                              onClick={() => onFilterSev(['critical'])}
                            >
                              {item?.stats?.vulnStats?.critical || 0}
                            </VulnBadge>
                          </Link>
                          <Link to={'https://google.com'}>
                            <VulnBadge
                              color='orange'
                              label='High'
                              onClick={() => onFilterSev(['critical'])}
                            >
                              {item?.stats?.vulnStats?.high || 0}
                            </VulnBadge>
                          </Link>
                          <Link to={'https://google.com'}>
                            <VulnBadge
                              color='yellow'
                              label='Medium'
                              onClick={() => onFilterSev(['critical'])}
                            >
                              {item?.stats?.vulnStats?.medium || 0}
                            </VulnBadge>
                          </Link>
                          <Link to={'https://google.com'}>
                            <VulnBadge
                              color='green'
                              label='Low'
                              onClick={() => onFilterSev(['critical'])}
                            >
                              {item?.stats?.vulnStats?.low || 0}
                            </VulnBadge>
                          </Link>
                        </Stack>
                      </Td>
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
