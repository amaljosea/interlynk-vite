/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'

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

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleDot, LuGitMerge, LuShieldCheck } from 'react-icons/lu'

const GetPartPolicies = gql`
  query GetPartPolicies($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
      project {
        projectGroup {
          name
        }
      }
      policyResultMetrics {
        skippedCount
        failedCount
        errorCount
        passedCount
        informCount
        warnCount
      }
      sbomParts {
        id
        part {
          projectVersion
          project {
            projectGroup {
              name
            }
          }
          stats {
            vulnStats
            compLicenseCount
          }
          policyResultMetrics {
            skippedCount
            failedCount
            errorCount
            passedCount
            informCount
            warnCount
          }
        }
      }
    }
    policyResults(sbomId: [$sbomId]) {
      totalCount
    }
  }
`

const PolicyTypes = ({ policy }) => {
  return (
    <Flex flexWrap={'wrap'} gap={1}>
      <VulnBadge color='red' label='Fail'>
        {policy?.failedCount || 0}
      </VulnBadge>
      <VulnBadge color='yellow' label='Warn'>
        {policy?.warnCount || 0}
      </VulnBadge>
      <VulnBadge color='blue' label='Inform'>
        {policy?.informCount || 0}
      </VulnBadge>
    </Flex>
  )
}

const PolicyParts = () => {
  const params = useParams()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { data, loading } = useQuery(GetPartPolicies, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { project, projectVersion, policyResultMetrics, sbomParts } =
    data?.sbom || {}
  const { policyResults } = data || {}

  const filteredData = sbomParts?.map((item) => {
    const metrics = item?.part?.policyResultMetrics

    const total =
      metrics?.skippedCount +
      metrics?.failedCount +
      metrics?.errorCount +
      metrics?.passedCount +
      metrics?.informCount +
      metrics?.warnCount

    return {
      id: item?.id,
      total: total,
      projectGroup: `${item?.part?.project?.projectGroup?.name} : ${item?.part?.projectVersion}`,
      metrics: item?.part?.policyResultMetrics
    }
  })

  const list = [
    {
      group: `${project?.projectGroup?.name} : ${projectVersion}`,
      count: policyResults?.totalCount || 0,
      stats: policyResultMetrics
    }
  ]

  filteredData?.forEach(({ total, projectGroup, metrics }) => {
    list.push({
      count: total || 0,
      group: projectGroup,
      stats: metrics
    })
  })

  const total = list.reduce((acc, { count }) => acc + count, 0)

  const hidden = sbomParts?.length === 0

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
              <Icon as={LuShieldCheck} color='gray.500' fontSize={24} />
              <Text fontWeight='bold'>Policies</Text>
            </HStack>
            {sbomParts?.length > 0 && !hidden ? (
              <Text fontWeight='bold' fontSize='lg'>
                {total}
              </Text>
            ) : (
              <Box pl={9}>
                <PolicyTypes policy={policyResultMetrics} />
              </Box>
            )}
          </Flex>
          <Divider hidden={hidden} />
          <VStack mt={1} align='start' spacing={2} hidden={hidden}>
            {list?.map(({ group, stats }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <Tooltip label={group}>
                  <HStack cursor={'pointer'}>
                    {index === 0 ? (
                      <LuCircleDot size={14} color={primaryBlueText} />
                    ) : (
                      <LuGitMerge size={14} color={primaryBlueText} />
                    )}
                    <Text fontSize='sm'>{truncatedValue(group, 20)}</Text>
                  </HStack>
                </Tooltip>
                <PolicyTypes policy={stats} />
              </HStack>
            ))}
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default PolicyParts
