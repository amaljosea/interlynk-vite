import { useMemo } from 'react'

import { Box, Flex } from '@chakra-ui/react'

import RowComponent from 'components/RowComponent'

const ExpandedRow = ({ data: { components = [] } }) => {
  const sortedComponents = useMemo(
    () => [...components].sort((a, b) => a.name.localeCompare(b.name)),
    [components]
  )

  return (
    <Box
      p={5}
      width={'100%'}
      boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
    >
      <Flex direction='row' py={5} alignItems='center' wrap='wrap' gap={2}>
        {sortedComponents?.map((component, index) => (
          <RowComponent key={index} content={component} />
        ))}
      </Flex>
    </Box>
  )
}

export default ExpandedRow
