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
        lines={[
          {
            dataKey: 'licensesCount',
            name: 'License Count'
          }
        ]}
      />
      <SingleGraph
        data={dataForGraph}
        lines={[
          {
            dataKey: 'licensesCount',
            name: 'License Count'
          }
        ]}
      />
      <SingleGraph
        data={dataForGraph}
        lines={[
          {
            dataKey: 'vulnerabilityCount',
            name: 'Total'
          },
          {
            dataKey: 'vulnerabilityCriticalCount',
            name: 'Critical',
            stroke: 'red'
          },
          {
            dataKey: 'vulnerabilityHighCount',
            name: 'High',
            stroke: 'orange'
          },
          {
            dataKey: 'vulnerabilityMediumCount',
            name: 'Medium',
            stroke: '#cbbb08'
          },
          {
            dataKey: 'vulnerabilityLowCount',
            name: 'Low',
            stroke: 'green'
          },
          {
            dataKey: 'vulnerabilityUnknownSevCount',
            name: 'Unknown',
            stroke: 'gray'
          }
        ]}
      />
    </Flex>
  )
}
