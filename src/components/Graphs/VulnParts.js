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

import { FaBug } from 'react-icons/fa6'

const GetPartVulns = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
      vulns(sbomId: $sbomId) {
        totalCount
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
          }
          vulns(sbomId: $sbomId) {
            totalCount
          }
        }
      }
    }
  }
`

const VulnTypes = ({ vuln }) => {
  return (
    <Flex flexWrap={'wrap'} gap={1} scale={0.5}>
      <VulnBadge color='red' label='Critical'>
        {vuln?.critical || 0}
      </VulnBadge>
      <VulnBadge color='orange' label='High'>
        {vuln?.high || 0}
      </VulnBadge>
      <VulnBadge color='yellow' label='Medium'>
        {vuln?.medium || 0}
      </VulnBadge>
      <VulnBadge color='green' label='Low'>
        {vuln?.low || 0}
      </VulnBadge>
      <VulnBadge color='gray' label='Unknown'>
        {vuln?.unknown || 0}
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
  const { projectVersion, vulns, sbomParts } = data?.sbom || {}

  const list = [
    { color: COLORS[0], group: projectVersion, count: vulns?.totalCount || 0 }
  ]
  sbomParts?.length > 0 &&
    sbomParts?.map(({ part }, index) => {
      list.push({
        color: COLORS[index + 1],
        group: part?.project?.projectGroup?.name,
        count: part?.vulns?.totalCount || 0
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
          <Flex justify='space-between' align='center'>
            <HStack spacing='3'>
              <Icon as={FaBug} color='gray.500' boxSize={5} />
              <Text fontWeight='bold'>Vulnerabilities</Text>
            </HStack>
            <Text fontWeight='bold' fontSize='lg'>
              {total}
            </Text>
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
            {list?.map(({ color, group, count }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <HStack>
                  <Circle size='2' bg={color} />
                  <Text fontSize='sm'>{group}</Text>
                </HStack>
                <Text fontSize='sm'>{count || 0}</Text>
              </HStack>
            ))}
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default VulnParts
