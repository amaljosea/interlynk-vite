/* eslint-disable no-restricted-syntax */
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'

import {
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

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleDot, LuComponent, LuGitMerge } from 'react-icons/lu'

const GetPartComponents = gql`
  query GetSbomParts($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      projectVersion
      project {
        projectGroup {
          name
        }
      }
      components(sbomId: $sbomId) {
        totalCount
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
            compCount
          }
        }
      }
    }
  }
`

const ComponentPart = () => {
  const params = useParams()

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { data, loading } = useQuery(GetPartComponents, {
    skip: !params.productid || !params.sbomid,
    variables: { projectId: params.productid, sbomId: params.sbomid }
  })
  const { project, projectVersion, components, sbomParts } = data?.sbom || {}

  const list = [
    {
      group: `${project?.projectGroup?.name} : ${projectVersion}`,
      count: components?.totalCount || 0
    }
  ]
  sbomParts?.forEach(({ part }) => {
    list.push({
      group: `${part?.project?.projectGroup?.name} : ${part?.projectVersion}`,
      count: part?.stats?.compCount || 0
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
              <Icon as={LuComponent} color='gray.500' fontSize={24} />
              <Text fontWeight='bold'>Components</Text>
            </HStack>
            <Text
              pl={sbomParts?.length > 0 && !hidden ? 0 : 9}
              fontWeight='bold'
              fontSize='lg'
            >
              {total}
            </Text>
          </Flex>
          <Divider hidden={hidden} />
          <VStack mt={1} align='start' spacing={3} hidden={hidden}>
            {list?.map(({ group, count }, index) => (
              <HStack key={index} w='full' justify='space-between'>
                <Tooltip label={group}>
                  <HStack cursor={'pointer'}>
                    {index === 0 ? (
                      <LuCircleDot size={14} color={primaryBlueText} />
                    ) : (
                      <LuGitMerge size={14} color={primaryBlueText} />
                    )}
                    <Text fontSize='sm'>{truncatedValue(group, 25)}</Text>
                  </HStack>
                </Tooltip>
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
