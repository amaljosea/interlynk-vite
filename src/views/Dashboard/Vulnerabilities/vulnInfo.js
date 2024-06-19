import { useQuery } from '@apollo/client'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime, linkURl } from 'utils'

import {
  Box,
  Flex,
  Icon,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CvssCard from 'components/Misc/CvssCard'
import VulnBadge from 'components/Misc/VulnBadge'

import { GetGlobalVulnData } from 'graphQL/Queries'

import { FaBug, FaCube, FaCubes } from 'react-icons/fa'
import { FaCodeMerge } from 'react-icons/fa6'

import VulnProdTable from './components/ProdTable'

const VulnInfo = () => {
  const location = useLocation()
  const params = useParams()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('vulnId') || params.vulnerabilityid
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data } = useQuery(GetGlobalVulnData, {
    skip: vulnId ? false : true,
    variables: {
      id: vulnId
    }
  })

  const { vuln } = data || ''
  const {
    source,
    desc,
    vulnInfo,
    cvssScore,
    cvssVector,
    publishedAt,
    sbomVersions,
    lastModifiedAt,
    componentCount,
    projectGroupsCount,
    sbomVersionsCount
  } = vuln || ''
  const { kev, epssScore } = vulnInfo || ''

  return (
    <>
      {/* Product Info */}
      <Card mb='6' display={vuln ? 'block' : 'none'}>
        <CardBody>
          <Flex
            direction={'row'}
            alignItems={'flex-start'}
            gap={5}
            width={'100%'}
            pb={2}
          >
            <Icon as={FaBug} h={'64px'} w={'64px'} color='blue.300' />
            <Flex direction={'column'} gap={0.5}>
              {/* PRODUCT TITLE */}
              <Link to={linkURl(source, vulnId)} target={'_blank'}>
                <Text
                  fontWeight={'semibold'}
                  fontSize={18}
                  _hover={{ color: 'blue.500' }}
                >
                  {vulnId}
                </Text>
              </Link>
              <Text fontSize={'sm'} my={0.5}>
                {desc || ''}
              </Text>
              <Flex flexWrap={'wrap'} gap={10} mt={2}>
                {/* Published At  */}
                <Text mt={1} fontSize={14}>
                  <strong>Published:</strong> {getFullDateAndTime(publishedAt)}
                </Text>
                {/* Last Modified At */}
                <Text mt={1} fontSize={14}>
                  <strong>Last Modified:</strong>{' '}
                  {getFullDateAndTime(lastModifiedAt)}
                </Text>
              </Flex>
              {/* --------------- STATS ------------------- */}
              <Flex
                flexDir={'row'}
                alignItems={'center'}
                flexWrap={'wrap'}
                gap={8}
                mt={6}
              >
                {/* PRODUCTS */}
                <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
                  <Icon h={5} w={5} color='#777' as={FaCubes} />
                  <Flex flexDir={'column'} alignItems={'center'}>
                    <Tag variant='subtle' width={16} colorScheme={'blue'}>
                      <TagLabel mx={'auto'}>{projectGroupsCount || 0}</TagLabel>
                    </Tag>

                    <Text fontSize={'xs'}>Products</Text>
                  </Flex>
                </Stack>
                {/* VERSIONS */}
                <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
                  <Icon h={4} w={4} color='#777' as={FaCodeMerge} />
                  <Flex flexDir={'column'} alignItems={'center'}>
                    <Tag variant='subtle' width={16} colorScheme={'blue'}>
                      <TagLabel mx={'auto'}>{sbomVersionsCount || 0}</TagLabel>
                    </Tag>
                    <Text fontSize={'xs'}>Versions</Text>
                  </Flex>
                </Stack>
                {/* COMPONENTS */}
                <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
                  <Icon h={'18px'} w={'18px'} color='#777' as={FaCube} />
                  <Flex flexDir={'column'} alignItems={'center'}>
                    <Tag variant='subtle' width={'full'} colorScheme={'blue'}>
                      <TagLabel mx={'auto'}>{componentCount || 0}</TagLabel>
                    </Tag>
                    <Text fontSize={'xs'}>Components</Text>
                  </Flex>
                </Stack>
                {/* VULNERABILITIES */}
                <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
                  <Icon h={4} w={4} color='#777' as={FaBug} />
                  <Box>
                    <Stack direction={'row'}>
                      <Flex flexDir={'column'} alignItems={'center'}>
                        <VulnBadge color='red' label='CVSS'>
                          {cvssScore || 0}
                        </VulnBadge>
                        <Text fontSize={'xs'}>CVSS</Text>
                      </Flex>
                      <Flex flexDir={'column'} alignItems={'center'}>
                        <VulnBadge color='orange' label='EPSS'>
                          {Math.ceil(epssScore * 10000 || 0)}
                        </VulnBadge>
                        <Text fontSize={'xs'}>EPSS</Text>
                      </Flex>
                      <Flex flexDir={'column'} alignItems={'center'}>
                        <VulnBadge color='yellow' label='KEV'>
                          {kev ? 'K' : '-'}
                        </VulnBadge>
                        <Text fontSize={'xs'}>KEV</Text>
                      </Flex>
                    </Stack>
                  </Box>
                </Stack>
                {/* CVSS VECTOR */}
                <Stack direction={'row'} alignItems={'flex-start'} spacing={2}>
                  <i
                    className='fa-solid fa-person-through-window'
                    style={{ marginTop: '3px', color: '#777' }}
                  ></i>
                  <Flex flexDir={'column'} alignItems={'center'}>
                    {cvssVector ? (
                      <Tag
                        variant='subtle'
                        width={'full'}
                        colorScheme={'cyan'}
                        cursor={'pointer'}
                        onClick={onOpen}
                      >
                        <TagLabel mx={'auto'}>{cvssVector || '-'}</TagLabel>
                      </Tag>
                    ) : (
                      <Tag
                        variant='subtle'
                        width={'full'}
                        colorScheme={'cyan'}
                        cursor={'pointer'}
                      >
                        <TagLabel mx={'auto'}>{cvssVector || '-'}</TagLabel>
                      </Tag>
                    )}
                    <Text fontSize={'xs'}>CVSS Vector</Text>
                  </Flex>
                </Stack>
              </Flex>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* Tab List */}
      <Card>
        <Tabs variant='enclosed'>
          {/* TAB LIST */}
          <TabList mt='20px'>
            {['Products'].map((item, index) => (
              <Tab key={index} _focus={{ outline: 'none' }}>
                {item}
              </Tab>
            ))}
          </TabList>
          {/* TAB PANELS */}
          <TabPanels>
            {/* PRODUCTS TABLE */}
            <TabPanel px={1}>
              <VulnProdTable sbomVersions={sbomVersions} vulnId={vulnId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* CVSS CARD */}
      {isOpen && (
        <CvssCard isOpen={isOpen} onClose={onClose} value={cvssVector} />
      )}
    </>
  )
}

export default VulnInfo
