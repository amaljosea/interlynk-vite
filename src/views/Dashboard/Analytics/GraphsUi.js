import { Grid } from '@chakra-ui/react'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph }) => {
  return (
    <Grid
      mt={4}
      gap={12}
      width={'100%'}
      alignItems={'center'}
      justifyContent='center'
      templateColumns={`repeat(2, 1fr)`}
    >
      <SingleGraph
        data={dataForGraph}
        lines={[
          {
            dataKey: 'componentsCount',
            name: 'Components Count'
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
            // eslint-disable-next-line
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
      <SingleGraph
        data={dataForGraph}
        lines={[
          {
            dataKey: 'averageVulnerabilityDuration',
            name: 'Patch Velocity'
          }
        ]}
      />
    </Grid>
  )
}
