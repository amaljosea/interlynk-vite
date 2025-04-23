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

import { FaCube } from 'react-icons/fa'

const GetPartComponents = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
      components(sbomId: $sbomId) {
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
            compCount
          }
        }
      }
    }
  }
`

const ComponentPart = () => {
  const params = useParams()

  const { data, loading } = useQuery(GetPartComponents, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { projectVersion, components, sbomParts } = data?.sbom || {}

  const list = [
    {
      color: COLORS[0],
      group: projectVersion,
      count: components?.totalCount || 0
    }
  ]
  sbomParts?.forEach(({ part }, index) => {
    list.push({
      color: COLORS[index + 1],
      group: part?.project?.projectGroup?.name,
      count: part?.stats?.compCount || 0
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
              <Icon as={FaCube} color='gray.500' boxSize={5} />
              <Text fontWeight='bold'>Components</Text>
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
            {list?.map(({ group, color, count }, index) => (
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

export default ComponentPart
