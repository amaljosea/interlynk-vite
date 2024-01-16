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
import { useLocation } from 'react-router-dom'
import { timeSince, getFullDateAndTime } from 'utils'
import VulnProdTable from './components/ProdTable'

const VulnInfo = ({ data }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')

  const vulnData = data ? data.nodes?.find((item) => item.id === vulnId) : null

  const prodData = [
    {
      id: 0,
      product: {
        name: 'dropwizard-core',
        version: '2.3.5'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: {
        name: 'In Triage'
      },
      vexJustification: null
    },
    {
      id: 1,
      product: {
        name: 'dropwizard-core',
        version: '2.3.4'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: {
        name: 'In Triage'
      },
      vexJustification: null
    },
    {
      id: 2,
      product: {
        name: 'dropwizard-core',
        version: '2.3.3'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: {
        name: 'Not Affected'
      },
      vexJustification: null
    },
    {
      id: 3,
      product: {
        name: 'purl-mapper',
        version: '1.3.2'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: {
        name: 'Affected'
      },
      vexJustification: null
    },
    {
      id: 4,
      product: {
        name: 'lynk-api',
        version: '0.3.4'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: 5,
      product: {
        name: 'lynk-api',
        version: '0.3.3'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: 6,
      product: {
        name: 'sbomex',
        version: '0.11.0'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: 7,
      product: {
        name: 'sbomex',
        version: '0.10.0'
      },
      component: {
        name: 'snakeyaml',
        version: '1.25'
      },
      vexStatus: null,
      vexJustification: null
    }
  ]

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
      {/* Product Info */}
      {vulnData && (
        <Card mb='6'>
          <CardBody>
            <Grid
              width={'100%'}
              templateColumns='repeat(5, 1fr)'
              alignItems={'top'}
            >
              {/* LEFT */}

              <GridItem colSpan={2}>
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
                      {vulnData.id}
                    </Text>

                    <Text fontSize={'sm'} my={0.5}>
                      H2 Console in versions since 1.1.100 (2008-10-14) to
                      2.0.204 (2021-12-21) inclusive allows loading of custom
                      classes from remote servers through JNDI.
                    </Text>
                    <Tooltip
                      placement='top'
                      label={getFullDateAndTime(vulnData.updatedAt)}
                    >
                      <Text fontSize='xs' cursor={'pointer'} my={1.5}>
                        Updated {timeSince(vulnData.updatedAt)}
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
                            {/* {vulnData.prods} */} 0
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
                            {/* {vulnData.vuln.resolved} */} 0
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
                                {vulnData.cvssScore}
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
                                {Math.ceil(vulnData?.vulnInfo?.epssScore * 10000 || 0)}
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
                                {vulnData?.vulnInfo?.epssScore ? '-' : 'K'}
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
              <VulnProdTable data={prodData} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Flex>
  )
}

export default VulnInfo
