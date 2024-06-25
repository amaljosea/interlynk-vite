import { Flex } from '@chakra-ui/react'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph }) => {
  return (
    <Flex
      mt={4}
      gap={8}
      width={'100%'}
      flexWrap={'wrap'}
      alignItems={'center'}
      justifyContent='center'
    >
      <SingleGraph
        data={dataForGraph}
        dataKey='licensesCount'
        name='License Count'
      />
      <SingleGraph
        data={dataForGraph}
        dataKey='componentsCount'
        name='Components Count'
      />
      <SingleGraph
        data={dataForGraph}
        dataKey='vulnerabilityCount'
        name='Vulnerability Count'
      />
    </Flex>
  )
}
