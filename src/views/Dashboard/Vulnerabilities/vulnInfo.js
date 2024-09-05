import { useQuery } from '@apollo/client'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getFullDateAndTime, linkURl } from 'utils'

import {
  Flex,
  Grid,
  GridItem,
  Icon,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'
import CvssCard from 'components/Misc/CvssCard'
import VulnBadge from 'components/Misc/VulnBadge'

import { GetGlobalVulnData } from 'graphQL/Queries'

import { FaBug, FaCube, FaCubes } from 'react-icons/fa'
import { FaCodeMerge } from 'react-icons/fa6'

import VulnProdTable from './components/ProdTable'

const StatsContainer = ({ icon, title, children }) => {
  const activeBg = useColorModeValue('gray.100', 'gray.800')
  const iconColor = useColorModeValue('blue.500', 'gray.100')
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card width='100%' h={'97px'}>
      <CardBody>
        <Flex width={'100%'} gap={3} align='center'>
          <IconBox h={12} w={12} color={iconColor} bg={activeBg}>
            {icon}
          </IconBox>
          <Stat>
            <StatLabel mb={1} fontSize='md'>
              {title}
            </StatLabel>
            <StatNumber fontSize='lg' color={textColor}>
              {children}
            </StatNumber>
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  )
}

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
      <Flex width={'100%'} flexDir={'column'} gap={5}>
        {/* Product Info */}
        <Card display={vuln ? 'block' : 'none'}>
          <CardBody>
            <Flex
              direction={'row'}
              alignItems={'flex-start'}
              gap={5}
              width={'100%'}
              pb={2}
            >
              <Icon as={FaBug} h={'64px'} w={'64px'} color='blue.300' />
              <Flex width={'100%'} direction={'column'} gap={0.5}>
                {/* PRODUCT TITLE */}
                <Link to={linkURl(source, vuln?.vulnId)} target={'_blank'}>
                  <Text
                    fontWeight={'semibold'}
                    fontSize={22}
                    _hover={{ color: 'blue.500' }}
                  >
                    {vuln?.vulnId}
                  </Text>
                </Link>
                <Text fontSize={'sm'} my={0.5}>
                  {desc || ''}
                </Text>
                <Flex
                  mt={6}
                  gap={6}
                  width={'100%'}
                  alignItems={'flex-start'}
                  justifyContent={'space-between'}
                >
                  {/* Published At  */}
                  <Stack dir='column' fontSize={'sm'}>
                    <Text fontWeight={'medium'}>Published:</Text>
                    <Text>{getFullDateAndTime(publishedAt)}</Text>
                  </Stack>
                  {/* Last Modified At */}
                  <Stack dir='column' fontSize={'sm'}>
                    <Text fontWeight={'medium'}>Last Modified:</Text>
                    <Text>{getFullDateAndTime(lastModifiedAt)}</Text>
                  </Stack>
                  {/* CVSS Vector */}
                  <Stack dir={'column'} fontSize={'sm'}>
                    <Text fontWeight={'medium'}>CVSS Vector</Text>
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
                    </Flex>
                  </Stack>
                </Flex>
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        <Grid
          gap={4}
          width={'100%'}
          alignItems={'flex-start'}
          templateColumns='repeat(12, 1fr)'
        >
          <GridItem colSpan={3}>
            <StatsContainer icon={<FaCubes size={22} />} title={'Products'}>
              {projectGroupsCount || 0}
            </StatsContainer>
          </GridItem>
          <GridItem colSpan={3}>
            <StatsContainer icon={<FaCodeMerge size={18} />} title={'Versions'}>
              {sbomVersionsCount || 0}
            </StatsContainer>
          </GridItem>
          <GridItem colSpan={3}>
            <StatsContainer icon={<FaCube size={18} />} title={'Components'}>
              {componentCount || 0}
            </StatsContainer>
          </GridItem>
          <GridItem colSpan={3}>
            <StatsContainer
              icon={<FaBug size={18} />}
              title={'Vulnerabilities'}
            >
              <Stack direction={'row'}>
                <VulnBadge color='red' label='CVSS'>
                  {cvssScore || 0}
                </VulnBadge>
                <VulnBadge color='orange' label='EPSS'>
                  {Math.ceil(epssScore * 10000 || 0)}
                </VulnBadge>
                <VulnBadge color='yellow' label='KEV'>
                  {kev ? 'K' : '-'}
                </VulnBadge>
              </Stack>
            </StatsContainer>
          </GridItem>
        </Grid>

        {/* Tab List */}
        <Card>
          <Tabs variant='enclosed'>
            {/* TAB LIST */}
            <TabList>
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
      </Flex>

      {/* CVSS CARD */}
      {isOpen && (
        <CvssCard isOpen={isOpen} onClose={onClose} value={cvssVector} />
      )}
    </>
  )
}

export default VulnInfo
