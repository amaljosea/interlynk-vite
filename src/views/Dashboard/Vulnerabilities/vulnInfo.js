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
  Badge
} from '@chakra-ui/react'
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import { FaCube, FaCubes, FaBug } from 'react-icons/fa'
import { timeSince, getFullDateAndTime } from 'utils'
import VulnProdTable from './components/ProdTable'

const VulnInfo = ({ data, refetch }) => {
  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
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
                    <Flex flexDir={'row'} alignItems={'center'} gap={4} mt={10}>
                      {/* PRODUCTS */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={4} w={4} color='#777' as={FaCubes} />
                        <Box>
                          <Badge
                            mr={1}
                            fontSize={'xl'}
                            fontWeight={'medium'}
                            bg={'none'}
                          >
                            {data?.organization?.projectGroups?.nodes?.length ||
                              0}
                          </Badge>
                          <Text fontSize={'xs'}>Products</Text>
                        </Box>
                      </Stack>
                      {/* COMPONENTS */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={'20px'} w={'20px'} color='#777' as={FaCube} />
                        <Box>
                          <Badge
                            mr={1}
                            fontSize={'xl'}
                            fontWeight={'medium'}
                            bg={'none'}
                          >
                            {data?.componentVulns?.nodes?.length || 0}
                          </Badge>
                          <Text fontSize={'xs'}>Components</Text>
                        </Box>
                      </Stack>
                      {/* VULNERABILITIES */}
                      <Stack
                        direction={'row'}
                        alignItems={'flex-start'}
                        spacing={2}
                      >
                        <Icon h={4} w={4} color='#777' as={FaBug} />
                        <Box>
                          <Stack fontWeight={'medium'} direction={'row'}>
                            <Tooltip label='CVSS' placement='top'>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='red'
                                borderRadius='md'
                                cursor={'pointer'}
                              >
                                {data?.cvssScore || 0}
                              </Badge>
                            </Tooltip>
                            <Tooltip label='EPSS' placement='top'>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='orange'
                                borderRadius='md'
                                cursor={'pointer'}
                              >
                                {Math.ceil(
                                  data.vulnInfo?.epssScore * 10000 || 0
                                )}
                              </Badge>
                            </Tooltip>
                            <Tooltip label='KEV' placement='top'>
                              <Badge
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                variant='subtle'
                                colorScheme='yellow'
                                borderRadius='md'
                                cursor={'pointer'}
                              >
                                {data?.vulnInfo?.epssScore ? '-' : 'K'}
                              </Badge>
                            </Tooltip>
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
              <VulnProdTable data={data?.componentVulns} refetch={refetch} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Flex>
  )
}

export default VulnInfo
