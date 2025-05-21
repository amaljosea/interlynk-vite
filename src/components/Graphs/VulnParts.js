/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams, truncatedValue } from 'utils'

import {
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  SkeletonText,
  Stack,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useScrollHide } from 'hooks/useScrollHide'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuBug, LuCircleDot, LuGitMerge } from 'react-icons/lu'

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
  const hide = useScrollHide(5)
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { data, loading } = useQuery(GetPartVulns, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { project, stats, projectVersion, vulns, sbomParts } = data?.sbom || {}

  const list = [
    {
      group: `${project?.projectGroup?.name} : ${projectVersion}`,
      count: vulns?.totalCount || 0,
      stats: stats?.vulnStats,
      part: data?.sbom
    }
  ]
  sbomParts?.length > 0 &&
    sbomParts?.map(({ part }) => {
      list.push({
        group: `${part?.project?.projectGroup?.name} : ${part?.projectVersion}`,
        count: part?.vulns?.totalCount || 0,
        stats: part?.stats?.vulnStats,
        part: part
      })
    })
  const total = list.reduce((acc, { count }) => acc + count, 0)

  const hidden = hide || sbomParts?.length === 0

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
            flexDir={sbomParts?.length > 0 && !hidden ? 'row' : 'column'}
            justify='space-between'
          >
            <HStack spacing='3'>
              <Icon as={LuBug} color='gray.500' fontSize={24} />
              <Text fontWeight='bold'>Vulnerabilities</Text>
            </HStack>
            {sbomParts?.length > 0 && !hidden ? (
              <Text fontWeight='bold' fontSize='lg'>
                {total}
              </Text>
            ) : (
              <Box pl={9}>
                <VulnTypes data={data?.sbom} />
              </Box>
            )}
          </Flex>
          <Divider hidden={hidden} />
          <VStack mt={1} align='start' spacing={2} hidden={hidden}>
            {list?.map(({ group, part }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <Tooltip label={group}>
                  <HStack cursor={'pointer'}>
                    {index === 0 ? (
                      <LuCircleDot size={14} color={primaryBlueText} />
                    ) : (
                      <LuGitMerge size={14} color={primaryBlueText} />
                    )}
                    <Text fontSize='sm'>{truncatedValue(group, 15)}</Text>
                  </HStack>
                </Tooltip>
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
