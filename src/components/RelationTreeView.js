import { findShortestPath, truncatedValue } from 'utils'

import { ArrowDownIcon } from '@chakra-ui/icons'
import { Box, Stack, Tag, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const RelationTreeView = ({ compPath, data }) => {
  const { name, version } = data || ''

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const shortestPath = findShortestPath(compPath)[0]

  return (
    <Box w={'100%'}>
      {compPath?.length > 0 ? (
        <Stack
          width={'100%'}
          mt={10}
          dir='column'
          spacing={2}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {shortestPath?.path?.length > 0 ? (
            shortestPath?.path?.map((item, index) => (
              <>
                <Tag
                  key={item?.id}
                  size='sm'
                  colorScheme={
                    index === 0 || index === shortestPath.path.length - 1
                      ? 'blue'
                      : 'green'
                  }
                >
                  {item?.name} - {truncatedValue(item?.version, 20)}
                </Tag>
                {index !== shortestPath.path.length - 1 && (
                  <ArrowDownIcon width={4} height={4} color={primaryBlueText} />
                )}
              </>
            ))
          ) : (
            <Text fontSize={'sm'}>
              Component is not connected to Primary component
            </Text>
          )}
        </Stack>
      ) : (
        <Stack width={'100%'} alignItems={'center'} justifyContent={'center'}>
          <Tag size='sm' colorScheme='green'>
            {name} - {version}
          </Tag>
        </Stack>
      )}
    </Box>
  )
}

export default RelationTreeView
