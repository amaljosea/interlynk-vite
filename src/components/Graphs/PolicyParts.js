/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
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

import { MdPolicy } from 'react-icons/md'

const GetPartPolicies = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
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

  const { data, loading } = useQuery(GetPartPolicies, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { projectVersion, policyResultMetrics, sbomParts } = data?.sbom || {}
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
      projectGroup: item?.part?.project?.projectGroup?.name,
      metrics: item?.part?.policyResultMetrics
    }
  })

  const list = [
    {
      color: COLORS[0],
      group: projectVersion,
      count: policyResults?.totalCount || 0,
      stats: policyResultMetrics
    }
  ]

  filteredData?.forEach(({ total, projectGroup, metrics }, index) => {
    list.push({
      count: total || 0,
      color: COLORS[index + 1],
      group: projectGroup,
      stats: metrics
    })
  })

  const total = list.reduce((acc, { count }) => acc + count, 0)

  const percent = (value) => `${(value / total) * 100}%`

  if (loading)
    return (
      <Card>
        <SkeletonText noOfLines={2} gap='4' skeletonHeight='3' />
      </Card>
    )

  return (
    <Card maxH={'200px'}>
      <CardBody>
        <Stack w={'100%'}>
          <Flex
            gap={2}
            flexDir={sbomParts?.length > 0 ? 'row' : 'column'}
            justify='space-between'
          >
            <HStack spacing='3'>
              <Icon as={MdPolicy} color='gray.500' boxSize={6} />
              <Text fontWeight='bold'>Policies</Text>
            </HStack>
            {sbomParts?.length > 0 ? (
              <Text fontWeight='bold' fontSize='lg'>
                {total}
              </Text>
            ) : (
              <Box pl={8}>
                <PolicyTypes policy={policyResultMetrics} />
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
            {list?.map(({ color, group, stats }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <HStack>
                  <Circle size='2' bg={color} />
                  <Text fontSize='sm'>{group}</Text>
                </HStack>
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
