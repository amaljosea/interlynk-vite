/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'
import { COLORS } from 'utils/styleUtils'

import {
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  SkeletonText,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { FaBug } from 'react-icons/fa6'

const GetPartVulns = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      projectVersion
      project {
        id
        name
        projectGroup {
          id
          name
        }
      }
      stats {
        vulnStats
      }
      vulns(sbomId: $sbomId) {
        totalCount
      }
      sbomParts {
        id
        part {
          id
          projectVersion
          project {
            id
            name
            projectGroup {
              id
              name
            }
          }
          stats {
            vulnStats
          }
          vulns(sbomId: $sbomId) {
            totalCount
          }
        }
      }
    }
  }
`

const VulnTypes = ({ data }) => {
  const navigate = useNavigate()
  const params = useParams()
  const { dispatch } = useGlobalState()
  const partsContext = usePartsContext()
  const signedUrlParams = getSignedUrlParams()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const { id, project, stats } = data || {}
  const { vulnStats } = stats || {}

  const { prodVulnDispatch } = dispatch

  const setActiveTab = (value) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: value
      }
    })
    navigate(link)
  }

  const onFilterVuln = (value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    if (!signedUrlParams) {
      setActiveTab('vulnerabilities')
    }
  }

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    productgroupid: project?.projectGroup?.id,
    productid: project?.id,
    sbomid: id,
    paramsObj: { tab: 'vulnerabilities', parts: true }
  })

  const onSelectPart = () => partsContext.push()

  const onFilterSev = (part, value, link) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    onSelectPart(part)
    navigate(link)
  }

  const handleFilter = (value) => {
    if (params?.sbomid === id) {
      onFilterVuln(value)
    } else {
      onFilterSev(data, value, link)
    }
  }

  return (
    <Flex flexWrap={'wrap'} gap={1} scale={0.5}>
      <VulnBadge
        color='red'
        label='Critical'
        onClick={() => handleFilter(['critical'])}
      >
        {vulnStats?.critical || 0}
      </VulnBadge>
      <VulnBadge
        color='orange'
        label='High'
        onClick={() => handleFilter(['high'])}
      >
        {vulnStats?.high || 0}
      </VulnBadge>
      <VulnBadge
        color='yellow'
        label='Medium'
        onClick={() => handleFilter(['medium'])}
      >
        {vulnStats?.medium || 0}
      </VulnBadge>
      <VulnBadge
        color='green'
        label='Low'
        onClick={() => handleFilter(['low'])}
      >
        {vulnStats?.low || 0}
      </VulnBadge>
      <VulnBadge
        color='gray'
        label='Unknown'
        onClick={() => handleFilter(['unknown'])}
      >
        {vulnStats?.unknown || 0}
      </VulnBadge>
    </Flex>
  )
}

const VulnParts = () => {
  const params = useParams()

  const { data, loading } = useQuery(GetPartVulns, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { stats, projectVersion, vulns, sbomParts } = data?.sbom || {}

  const list = [
    {
      color: COLORS[0],
      group: projectVersion,
      count: vulns?.totalCount || 0,
      stats: stats?.vulnStats,
      part: data?.sbom
    }
  ]
  sbomParts?.length > 0 &&
    sbomParts?.map(({ part }, index) => {
      list.push({
        color: COLORS[index + 1],
        group: part?.project?.projectGroup?.name,
        count: part?.vulns?.totalCount || 0,
        stats: part?.stats?.vulnStats,
        part: part
      })
    })
  const total = list.reduce((acc, { count }) => acc + count, 0)

  console.warn('list', list)

  const percent = (value) => `${(value / total) * 100}%`

  if (loading)
    return (
      <Card>
        <SkeletonText noOfLines={2} gap='4' skeletonHeight='3' />
      </Card>
    )

  return (
    <Card minH='auto' maxH='400px' overflowY='scroll'>
      <CardBody>
        <Stack w={'100%'}>
          <Flex
            gap={2}
            flexDir={sbomParts?.length > 0 ? 'row' : 'column'}
            justify='space-between'
          >
            <HStack spacing='3'>
              <Icon as={FaBug} color='gray.500' boxSize={5} />
              <Text fontWeight='bold'>Vulnerabilities</Text>
            </HStack>
            {sbomParts?.length > 0 ? (
              <Text fontWeight='bold' fontSize='lg'>
                {total}
              </Text>
            ) : (
              <Box pl={8}>
                <VulnTypes data={data?.sbom} />
              </Box>
            )}
          </Flex>
          <Flex
            hidden={sbomParts?.length === 0}
            height='8px'
            borderRadius='full'
            overflow='hidden'
            w='100%'
            my='2'
          >
            {list?.map(({ color, count }, index) => (
              <Box key={index} bg={color} width={percent(count || 0)} />
            ))}
          </Flex>
          <VStack align='start' spacing={2} hidden={sbomParts?.length === 0}>
            {list?.map(({ color, group, part }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <HStack>
                  <Circle size='2' bg={color} />
                  <Text fontSize='sm'>{group}</Text>
                </HStack>
                <VulnTypes data={part} />
              </HStack>
            ))}
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default VulnParts
