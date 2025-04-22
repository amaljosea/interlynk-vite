/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import {
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import LynkLoader from 'components/Misc/LynkLoader'
import VulnBadge from 'components/Misc/VulnBadge'

import { MdPolicy } from 'react-icons/md'

const GetPartPolicies = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
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
  const { sbomParts } = data?.sbom || {}

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
      projectGroup: item?.part?.project?.projectGroup?.name,
      total: total
    }
  })

  const total = filteredData?.reduce((acc, { total }) => acc + (total || 0), 0)

  const percent = (value) => `${(value / total) * 100}%`

  const COLORS = {
    0: '#E2E8F0', // light gray
    1: '#3182CE', // blue
    2: '#90CDF4' // light blue
  }

  if (loading)
    return (
      <Card minH={'200px'}>
        <LynkLoader />
      </Card>
    )

  return (
    <Card minH={'200px'}>
      <CardBody>
        <Stack w={'100%'}>
          <Flex justify='space-between' align='center'>
            <HStack spacing='3'>
              <Icon as={MdPolicy} color='gray.500' boxSize={5} />
              <Text fontWeight='bold'>Policies</Text>
            </HStack>
            <Text fontWeight='bold' fontSize='lg'>
              {total}
            </Text>
          </Flex>
          <Flex
            height='8px'
            borderRadius='full'
            overflow='hidden'
            w='100%'
            my='2'
          >
            {filteredData?.map(({ id, total }, index) => (
              <Box
                key={id}
                bg={COLORS[index]}
                width={percent(total || 0)}
                borderLeftRadius={sbomParts?.length > 2 ? 'full' : 'none'}
              />
            ))}
          </Flex>
          <VStack align='start' spacing={2}>
            {filteredData?.map(({ id, projectGroup, total }, index) => (
              <HStack key={id} w='full' justify='space-between'>
                <HStack>
                  <Circle size='2' bg={COLORS[index]} />
                  <Text fontSize='sm'>{projectGroup}</Text>
                </HStack>
                <Text fontSize='sm'>{total || 0}</Text>
              </HStack>
            ))}
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default PolicyParts
