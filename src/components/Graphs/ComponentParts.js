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

import { FaCube } from 'react-icons/fa'

const GetPartComponents = gql`
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
  const { sbomParts } = data?.sbom || {}

  const total = sbomParts?.reduce(
    (acc, { part }) => acc + (part?.stats?.compCount || 0),
    0
  )

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
              <Icon as={FaCube} color='gray.500' boxSize={5} />
              <Text fontWeight='bold'>Components</Text>
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
            {sbomParts?.map(({ id, part }, index) => (
              <Box
                key={id}
                bg={COLORS[index]}
                width={percent(part?.stats?.compCount || 0)}
                borderLeftRadius={sbomParts?.length > 2 ? 'full' : 'none'}
              />
            ))}
          </Flex>
          <VStack align='start' spacing={2}>
            {sbomParts?.map(({ id, part }, index) => (
              <HStack key={id} w='full' justify='space-between'>
                <HStack>
                  <Circle size='2' bg={COLORS[index]} />
                  <Text fontSize='sm'>{part?.project?.projectGroup?.name}</Text>
                </HStack>
                <Text fontSize='sm'>{part?.stats?.compCount || 0}</Text>
              </HStack>
            ))}
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default ComponentPart
