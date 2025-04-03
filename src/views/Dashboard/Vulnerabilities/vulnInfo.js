import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDate, linkURl, truncatedValue } from 'utils'

import { Link, SkeletonText } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Flex, Icon, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import IconBox from 'components/Icons/IconBox'
import { CustomText } from 'components/Misc/CustomText'
import CvssCard from 'components/Misc/CvssCard'
import SeverityTag from 'components/Misc/SeverityTag'

import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetGlobalVulnData } from 'graphQL/Queries'

import { FaBug, FaCube, FaCubes } from 'react-icons/fa'
import { FaCodeMerge } from 'react-icons/fa6'

import VulnProdTable from './components/ProdTable'

export const GetProjectVersions = gql`
  query GetProjectVersions($id: Uuid!) {
    project(id: $id) {
      sbomVersions {
        totalCount
        nodes {
          projectVersion
        }
      }
    }
  }
`

export const GetCompVulnData = gql`
  query GetCompVulnData(
    $id: Uuid!
    $projectGroupIds: [Uuid!]
    $projectIds: [Uuid!]
  ) {
    componentVulns(
      vulnId: $id
      first: 1000
      projectGroupIds: $projectGroupIds
      projectIds: $projectIds
    ) {
      totalCount
    }
  }
`

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

  const { data: versions } = useQuery(GetProjectVersions, {
    skip: params?.productid ? false : true,
    variables: { id: params?.productid }
  })
  const { nodes } = versions?.project?.sbomVersions || ''

  const productVersions = nodes?.map((item) => item?.projectVersion)

  const { vuln } = data || ''
  const {
    source,
    desc,
    vulnInfo,
    cvssVector,
    publishedAt,
    sbomVersions,
    lastModifiedAt,
    componentCount,
    projectGroups,
    projectGroupsCount,
    sbomVersionsCount,
    sev,
    cvssScore
  } = vuln || ''

  const { kev, epssScore, epssPercentile } = vulnInfo || ''

  const productList =
    projectGroups?.nodes?.length > 0 ? projectGroups?.nodes : []

  const versionList = params?.productid ? productVersions : sbomVersions

  const { data: vulns } = useQuery(GetCompVulnData, {
    skip: params?.productid ? false : true,
    variables: {
      id: id,
      projectIds: [params?.productid],
      projectGroupIds: [params?.productgroupid]
    }
  })
  const { totalCount } = vulns?.componentVulns || ''

  const cvssColor =
    cvssVector && !cvssVector?.startsWith('[')
      ? primaryBlueText
      : primaryTextColor

  const isInvalid = !cvssVector || cvssVector?.startsWith('[')

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
              gap={5}
              direction={'row'}
              width={'100%'}
              alignItems={'flex-start'}
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
                {desc !== '' && (
                  <Text fontSize={'sm'} my={0.5}>
                    {truncatedValue(desc, 300)}
                  </Text>
                )}
                <Flex
                  mt={6}
                  w={'100%'}
                  columnGap={20}
                  alignItems={'flex-start'}
                  flexWrap='wrap'
                  rowGap={4}
                >
                  {/* Published At  */}
                  <Stack spacing={1} fontSize={'sm'}>
                    <CustomText>Published :</CustomText>
                    <Text>{getFullDate(publishedAt)}</Text>
                  </Stack>
                  {/* Last Modified At */}
                  <Stack spacing={1} fontSize={'sm'}>
                    <CustomText>Last Modified :</CustomText>
                    <Text>{getFullDate(lastModifiedAt)}</Text>
                  </Stack>
                  {/* Severity */}
                  <Stack spacing={1} fontSize={'sm'} whiteSpace='break-words'>
                    <CustomText>Severity :</CustomText>
                    <SeverityTag value={sev} />
                  </Stack>
                  {/*   EPSS Percentile */}
                  <Stack spacing={1} fontSize={'sm'}>
                    <CustomText>EPSS :</CustomText>
                    <Text>{epssScore}</Text>
                  </Stack>
                  {/*   EPSS Percentile */}
                  <Stack spacing={1} fontSize={'sm'}>
                    <CustomText>EPSS Percentile:</CustomText>
                    <Text>
                      {epssPercentile ? (epssPercentile * 100).toFixed() : 0}%
                    </Text>
                  </Stack>
                  {/*  KEV */}
                  <Stack spacing={1} fontSize={'sm'}>
                    <CustomText>KEV :</CustomText>
                    <Text>{kev ? 'Yes' : 'No'}</Text>
                  </Stack>
                  {/* cvssScore */}
                  <Stack spacing={1} fontSize={'sm'} whiteSpace='break-words'>
                    <CustomText>CVSS :</CustomText>
                    <Text>{cvssScore}</Text>
                  </Stack>
                  {/* CVSS Vector */}
                  <Stack spacing={1} fontSize={'sm'} whiteSpace='break-words'>
                    <CustomText>CVSS Vector :</CustomText>
                    <Text
                      color={cvssColor}
                      cursor={'pointer'}
                      onClick={() => (isInvalid ? null : onOpen())}
                    >
                      {cvssVector || 'N/A'}
                    </Text>
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
          <GridItem colSpan={4}>
            <StatsContainer icon={<FaCubes size={22} />} title={'Products'}>
              {params?.productid ? 1 : projectGroupsCount}
            </StatsContainer>
          </GridItem>
          <GridItem colSpan={4}>
            <StatsContainer icon={<FaCodeMerge size={18} />} title={'Versions'}>
              {params?.productid ? productVersions?.length : sbomVersionsCount}
            </StatsContainer>
          </GridItem>
          <GridItem colSpan={4}>
            <StatsContainer icon={<FaCube size={18} />} title={'Components'}>
              {params?.productid ? totalCount : componentCount}
            </StatsContainer>
          </GridItem>
        </Grid>

        {/* Tab List */}
        <Card>
          <VulnProdTable
            prodGroups={productList}
            sbomVersions={versionList}
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
