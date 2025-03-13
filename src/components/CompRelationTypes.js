import { truncatedValue } from 'utils'

import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import CustomLoader from './CustomLoader'

const CompRelationTypes = (props) => {
  const { loading, isAdded, dependencyOfList, dependsOnList, handleDelete } =
    props

  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  if (loading) return <CustomLoader />

  return (
    <Stack spacing={6}>
      <Stack>
        <Text fontSize={'sm'} fontWeight={'medium'}>
          Dependency Of
        </Text>
        {dependencyOfList?.length === 0 ? (
          <Text fontSize={'sm'} color={secondaryTextInverse}>
            Not available
          </Text>
        ) : (
          <Flex flexDirection={'row'} flexWrap={'wrap'} gap={2}>
            {dependencyOfList.map((comp, index) => (
              <Tag
                size={'sm'}
                key={index}
                variant='subtle'
                colorScheme={'blue'}
                width={'fit-content'}
              >
                <TagLabel>
                  {truncatedValue(comp?.fromComp?.name, 20)}-
                  {truncatedValue(comp?.fromComp?.version, 20)}
                </TagLabel>
                <TagCloseButton
                  data-testid='delete_depends_on'
                  onClick={() => handleDelete(comp)}
                />
              </Tag>
            ))}
          </Flex>
        )}
      </Stack>
      <Stack>
        <Text fontSize='sm' fontWeight={'medium'}>
          Depends On
        </Text>
        {dependsOnList?.length === 0 ? (
          <Text fontSize={'sm'} color={secondaryTextInverse}>
            Not available
          </Text>
        ) : (
          <Flex flexDirection={'row'} flexWrap={'wrap'} gap={2}>
            {[...dependsOnList]
              .sort((a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt))
              .map((comp, index) => (
                <Tooltip key={index} label={comp?.toComp?.name} placement='top'>
                  <Tag
                    size={'sm'}
                    variant='subtle'
                    colorScheme={index == 0 && isAdded ? 'green' : 'blue'}
                    width={'fit-content'}
                  >
                    <TagLabel>
                      {truncatedValue(comp?.toComp?.name, 20)}-
                      {truncatedValue(comp?.toComp?.version, 20)}
                    </TagLabel>
                    <TagCloseButton
                      data-testid='delete_depends_on'
                      onClick={() => handleDelete(comp)}
                    />
                  </Tag>
                </Tooltip>
              ))}
          </Flex>
        )}
      </Stack>
    </Stack>
  )
}

export default CompRelationTypes
