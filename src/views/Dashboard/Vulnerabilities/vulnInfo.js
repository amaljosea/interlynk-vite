// Chakra imports
import {
  Flex,
  Icon,
  Grid,
  GridItem,
  Text,
  Popover,
  PopoverTrigger,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  Box,
  Tag,
  TagLabel,
  Tooltip
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import { FaCube, FaCubes, FaBug } from 'react-icons/fa'
import { getFullDateAndTime } from 'utils'
import VulnProdTable from './components/ProdTable'
import { FaCodeMerge, FaVectorSquare } from 'react-icons/fa6'
import VulnBadge from 'components/Misc/VulnBadge'
import { Link } from 'react-router-dom'
import { linkURl } from 'utils'
import CvssCard from 'components/Misc/CvssCard'

const VulnInfo = ({ data, componentVulns, refetch }) => {
  return (
    <>
      {/* Product Info */}
      {data && (
        <Card mb='6'>
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
                <Link
                  to={linkURl(data?.source, data?.vulnId)}
                  target={'_blank'}
                >
                  <Text
                    fontWeight={'semibold'}
                    fontSize={18}
                    _hover={{ color: 'blue.500' }}
                  >
                    {data?.vulnId}
                  </Text>
                </Link>
                <Text fontSize={'sm'} my={0.5}>
                  {data?.desc || ''}
                </Text>
                <Flex flexWrap={'wrap'} gap={10} mt={2}>
                  {/* Published At  */}
                  <Text mt={1} fontSize={14}>
                    <strong>Published:</strong>{' '}
                    {getFullDateAndTime(data?.publishedAt)}
                  </Text>
                  {/* Last Modified At */}
                  <Text mt={1} fontSize={14}>
                    <strong>Last Modified:</strong>{' '}
                    {getFullDateAndTime(data?.lastModifiedAt)}
                  </Text>
                </Flex>
                {/* --------------- STATS ------------------- */}
                <Flex
                  flexDir={'row'}
                  alignItems={'center'}
                  flexWrap={'wrap'}
                  gap={6}
                  mt={6}
                >
                  {/* PRODUCTS */}
                  <Stack
                    direction={'row'}
                    alignItems={'flex-start'}
                    spacing={2}
                  >
                    <Icon h={5} w={5} color='#777' as={FaCubes} />
                    <Flex flexDir={'column'} alignItems={'center'}>
                      <Tag variant='subtle' width={16} colorScheme={'blue'}>
                        <TagLabel mx={'auto'}>
                          {data?.projectGroupsCount || 0}
                        </TagLabel>
                      </Tag>

                      <Text fontSize={'xs'}>Products</Text>
                    </Flex>
                  </Stack>
                  {/* VERSIONS */}
                  <Stack
                    direction={'row'}
                    alignItems={'flex-start'}
                    spacing={2}
                  >
                    <Icon h={4} w={4} color='#777' as={FaCodeMerge} />
                    <Flex flexDir={'column'} alignItems={'center'}>
                      <Tag variant='subtle' width={16} colorScheme={'blue'}>
                        <TagLabel mx={'auto'}>
                          {data?.sbomVersionsCount || 0}
                        </TagLabel>
                      </Tag>
                      <Text fontSize={'xs'}>Versions</Text>
                    </Flex>
                  </Stack>
                  {/* COMPONENTS */}
                  <Stack
                    direction={'row'}
                    alignItems={'flex-start'}
                    spacing={2}
                  >
                    <Icon h={'18px'} w={'18px'} color='#777' as={FaCube} />
                    <Flex flexDir={'column'} alignItems={'center'}>
                      <Tag variant='subtle' width={'full'} colorScheme={'blue'}>
                        <TagLabel mx={'auto'}>
                          {data?.componentCount || 0}
                        </TagLabel>
                      </Tag>
                      <Text fontSize={'xs'}>Components</Text>
                    </Flex>
                  </Stack>
                  {/* VULNERABILITIES */}
                  <Stack
                    direction={'row'}
                    alignItems={'flex-start'}
                    spacing={2}
                  >
                    <Icon h={4} w={4} color='#777' as={FaBug} />
                    <Box>
                      <Stack direction={'row'}>
                        <Flex flexDir={'column'} alignItems={'center'}>
                          <VulnBadge color='red' label='CVSS'>
                            {data?.cvssScore || 0}
                          </VulnBadge>
                          <Text fontSize={'xs'}>CVSS</Text>
                        </Flex>
                        <Flex flexDir={'column'} alignItems={'center'}>
                          <VulnBadge color='orange' label='EPSS'>
                            {Math.ceil(data.vulnInfo?.epssScore * 10000 || 0)}
                          </VulnBadge>
                          <Text fontSize={'xs'}>EPSS</Text>
                        </Flex>
                        <Flex flexDir={'column'} alignItems={'center'}>
                          <VulnBadge color='yellow' label='KEV'>
                            {data?.vulnInfo?.kev ? 'K' : '-'}
                          </VulnBadge>
                          <Text fontSize={'xs'}>KEV</Text>
                        </Flex>
                      </Stack>
                    </Box>
                  </Stack>
                  {/* CVSS VECTOR */}
                  <Stack
                    direction={'row'}
                    alignItems={'flex-start'}
                    spacing={2}
                  >
                    <i
                      class='fa-solid fa-person-through-window'
                      style={{ marginTop: '3px', color: '#777' }}
                    ></i>
                    <Flex flexDir={'column'} alignItems={'center'}>
                      {data?.cvssVector ? (
                        <Tooltip
                          bg='gray.50'
                          label={<CvssCard value={data?.cvssVector} />}
                          placement='top'
                        >
                          <Tag
                            variant='subtle'
                            width={'full'}
                            colorScheme={'cyan'}
                            cursor={'pointer'}
                          >
                            <TagLabel mx={'auto'}>
                              {data?.cvssVector || '-'}
                            </TagLabel>
                          </Tag>
                        </Tooltip>
                      ) : (
                        <Tag
                          variant='subtle'
                          width={'full'}
                          colorScheme={'cyan'}
                          cursor={'pointer'}
                        >
                          <TagLabel mx={'auto'}>
                            {data?.cvssVector || '-'}
                          </TagLabel>
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
      )}

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
              <VulnProdTable
                data={componentVulns}
                vuln={data}
                refetch={refetch}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </>
  )
}

export default VulnInfo
