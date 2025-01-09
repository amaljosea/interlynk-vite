import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDate, linkURl } from 'utils'

import { Link, SimpleGrid, SkeletonText } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Flex, Icon, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'
import CvssCard from 'components/Misc/CvssCard'
import VulnBadge from 'components/Misc/VulnBadge'

import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetGlobalVulnData } from 'graphQL/Queries'

import { FaBug, FaCube, FaCubes } from 'react-icons/fa'
import { FaCodeMerge } from 'react-icons/fa6'

import VulnProdTable from './components/ProdTable'

const StatsContainer = ({ icon, title, children }) => {
  const { primaryBlueText, secondaryBgColor, primaryTextColor } = useThemeColor(
    ['primaryBlueText', 'secondaryBgColor', 'primaryTextColor']
  )
  return (
    <Card width='100%' h={'97px'}>
      <CardBody>
        <Flex width={'100%'} gap={3} align='center'>
          <IconBox h={12} w={12} color={primaryBlueText} bg={secondaryBgColor}>
            {icon}
          </IconBox>
          <Stat>
            <StatLabel mb={1} fontSize='md'>
              {title}
            </StatLabel>
            <StatNumber fontSize='lg' color={primaryTextColor}>
              {children}
            </StatNumber>
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  )
}

const VulnInfo = () => {
  const params = useParams()
  const id = useQueryParam('vulnId') || params.vulnerabilityid

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { primaryBlueText, secondaryBlueText, primaryTextColor } =
    useThemeColor(['primaryBlueText', 'secondaryBlueText', 'primaryTextColor'])

  const { data, loading } = useQuery(GetGlobalVulnData, {
    skip: id ? false : true,
    variables: { id }
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

  const cvssColor =
    cvssVector && !cvssVector?.startsWith('[')
      ? primaryBlueText
      : primaryTextColor

  const isInvalid = cvssVector?.startsWith('[')

  if (loading)
    return (
      <Card>
        <SkeletonText mx='2' noOfLines={4} spacing='4' skeletonHeight='4' />
      </Card>
    )

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
              <Icon
                as={FaBug}
                h={'64px'}
                w={'64px'}
                color={secondaryBlueText}
              />
              <Flex width={'100%'} direction={'column'} gap={0.5}>
                {/* PRODUCT TITLE */}
                <Link
                  isExternal
                  w={'fit-content'}
                  href={linkURl(source, vuln?.vulnId)}
                >
                  <Text
                    fontSize={22}
                    fontWeight={'semibold'}
                    _hover={{ color: primaryBlueText }}
                  >
                    {vuln?.vulnId}
                  </Text>
                </Link>
                <Text fontSize={'sm'} my={0.5}>
                  {desc || ''}
                </Text>
                <SimpleGrid mt={6} columnGap={6} columns={3}>
                  {/* Published At  */}
                  <Stack dir='column' fontSize={'sm'}>
                    <Text fontWeight={'medium'}>Published:</Text>
                    <Text>{getFullDate(publishedAt)}</Text>
                  </Stack>
                  {/* Last Modified At */}
                  <Stack dir='column' fontSize={'sm'}>
                    <Text fontWeight={'medium'}>Last Modified:</Text>
                    <Text>{getFullDate(lastModifiedAt)}</Text>
                  </Stack>
                  {/* CVSS Vector */}
                  <Stack dir={'column'} fontSize={'sm'}>
                    <Text fontWeight={'medium'}>CVSS Vector</Text>
                    <Text
                      color={cvssColor}
                      cursor={'pointer'}
                      onClick={() => (isInvalid ? null : onOpen())}
                    >
                      {cvssVector || 'N/A'}
                    </Text>
                  </Stack>
                </SimpleGrid>
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
          <VulnProdTable
            sbomVersions={sbomVersions}
            vuln={{ id: id, vulnId: vuln?.vulnId }}
          />
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
