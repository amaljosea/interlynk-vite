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
import { FaBalanceScale, FaCube, FaCubes } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { timeSince, getFullDateAndTime } from 'utils'
import VulnProdTable from './components/ProdTable'

const VulnInfo = ({ data }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const vulnId = queryParams.get('id')

  const vulnData = data.find((item) => item.id === vulnId)

  const prodData = [
    {
      id: '35004de9-4cb8-437e-a026-a23e87c15a53',
      product: {
        name: 'dropwizard-core',
        version: '2.3.5'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: '05d93b5e-3164-4661-859f-6296f2567260',
      product: {
        name: 'purl-mapper',
        version: '1.3.2'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: '06c5eb02-75ad-4055-894d-dccc80d165af',
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
      id: 'b134e43d-31b8-4fee-95cf-7a7b320a2ddf',
      product: {
        name: 'sbomex',
        version: '4.3.2'
      },
      component: {
        name: 'snakeyaml',
        version: '1.26'
      },
      vexStatus: null,
      vexJustification: null
    },
    {
      id: '2a6eb043-4f10-460b-bf38-02924c0f29f6',
      product: {
        name: 'cyclonedx',
        version: '4.2.1'
      },
      component: {
        name: 'commons-text',
        version: '1.9'
      },
      vexStatus: null,
      vexJustification: null
    }
  ]

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
      {/* Product Info */}
      {vulnId && (
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
                  <Icon as={FaCubes} h={'64px'} w={'64px'} color='blue.300' />
                  <Flex direction={'column'} gap={0.5}>
                    {/* PRODUCT TITLE */}
                    <Text fontWeight={'semibold'} fontSize={18}>
                      {vulnData.vuln.vulnId}
                    </Text>

                    <Text fontSize={'sm'} my={0.5}>
                      A common specification for continous delivery events
                    </Text>
                    <Tooltip
                      placement='top'
                      label={getFullDateAndTime(vulnData.vuln.updatedAt)}
                    >
                      <Text fontSize='xs' cursor={'pointer'}>
                        Updated {timeSince(vulnData.vuln.updatedAt)}
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
                        <Icon h={4} w={4} color='#777' as={FaCube} />
                        <Box>
                          <Badge
                            mr={1}
                            fontSize={'xl'}
                            fontWeight={'medium'}
                            bg={'none'}
                          >
                            12
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
                        <Icon
                          h={'20px'}
                          w={'20px'}
                          color='#777'
                          as={FaBalanceScale}
                        />
                        <Box>
                          <Badge
                            mr={1}
                            fontSize={'xl'}
                            fontWeight={'medium'}
                            bg={'none'}
                          >
                            8
                          </Badge>
                          <Text fontSize={'xs'}>Components</Text>
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
