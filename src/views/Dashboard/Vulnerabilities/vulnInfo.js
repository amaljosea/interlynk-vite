// Chakra imports
import {
  Flex,
  Icon,
  Grid,
  GridItem,
  Text,
  Tooltip,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  Box,
  Tag,
  TagLabel
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import { FaCube, FaCubes, FaBug } from 'react-icons/fa'
import { timeSince, getFullDateAndTime } from 'utils'
import VulnProdTable from './components/ProdTable'
import { FaCodeMerge } from 'react-icons/fa6'
import VulnBadge from 'components/Misc/VulnBadge'

const VulnInfo = ({ data, componentVulns, refetch }) => {
  return (
    <>
      {/* Product Info */}
      {data && (
        <Card mb='6'>
          <CardBody>
            <Grid
              width={'100%'}
              templateColumns='repeat(5, 1fr)'
              alignItems={'top'}
            >
              {/* LEFT */}
              <GridItem colSpan={4}>
                <Flex
                  direction={'row'}
                  alignItems={'flex-start'}
                  gap={5}
                  width={'100%'}
                >
                  <Icon as={FaBug} h={'64px'} w={'64px'} color='blue.300' />
                  <Flex direction={'column'} gap={0.5}>
                    {/* PRODUCT TITLE */}
                    <Text fontWeight={'semibold'} fontSize={18}>
                      {data?.vulnId}
                    </Text>

                    <Text fontSize={'sm'} my={0.5}>
                      {data?.desc || ''}
                    </Text>
                    <Tooltip
                      placement='top'
                      label={getFullDateAndTime(data?.updatedAt)}
                    >
                      <Text fontSize='xs' cursor={'pointer'} my={1.5}>
                        Updated {timeSince(data?.updatedAt)}
                      </Text>
                    </Tooltip>
                    {/* --------------- STATS ------------------- */}
                    <Flex flexDir={'row'} alignItems={'center'} gap={4} mt={6}>
                      {/* PRODUCTS */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={5} w={5} color='#777' as={FaCubes} />
                        <Box>
                          <Tag variant='subtle' width={16} colorScheme={'blue'}>
                            <TagLabel mx={'auto'}>
                              {data?.projectGroupsCount || 0}
                            </TagLabel>
                          </Tag>

                          <Text fontSize={'xs'}>Products</Text>
                        </Box>
                      </Stack>
                      {/* VERSIONS */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={5} w={5} color='#777' as={FaCodeMerge} />
                        <Box>
                          <Tag variant='subtle' width={16} colorScheme={'blue'}>
                            <TagLabel mx={'auto'}>
                              {data?.sbomVersionsCount || 0}
                            </TagLabel>
                          </Tag>
                          <Text fontSize={'xs'}>Versions</Text>
                        </Box>
                      </Stack>
                      {/* COMPONENTS */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={5} w={5} color='#777' as={FaCube} />
                        <Box>
                          <Tag variant='subtle' width={16} colorScheme={'blue'}>
                            <TagLabel mx={'auto'}>
                              {data?.componentCount || 0}
                            </TagLabel>
                          </Tag>
                          <Text fontSize={'xs'}>Components</Text>
                        </Box>
                      </Stack>
                      {/* VULNERABILITIES */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={5} w={5} color='#777' as={FaBug} />
                        <Box>
                          <Stack fontWeight={'medium'} direction={'row'}>
                            <VulnBadge color='red' label='CVSS'>
                              {data?.cvssScore || 0}
                            </VulnBadge>
                            <VulnBadge color='orange' label='EPSS'>
                              {Math.ceil(data.vulnInfo?.epssScore * 10000 || 0)}
                            </VulnBadge>
                            <VulnBadge color='cyan' label='KEV'>
                              {data?.vulnInfo?.kev ? 'K' : '-'}
                            </VulnBadge>
                          </Stack>
                          <Text fontSize={'xs'}>Vulnerabilities</Text>
                        </Box>
                      </Stack>
                    </Flex>
                  </Flex>
                </Flex>
              </GridItem>
            </Grid>
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
