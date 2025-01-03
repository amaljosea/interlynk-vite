import { Grid, useTheme } from '@chakra-ui/react'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph }) => {
  const theme = useTheme()
  const updatedDataForGraph = dataForGraph.map((item) => ({
    ...item,
    totalVulnerabilityCount:
      item.vulnerabilityCount + item.vulnerabilityNotAffectedCount
  }))

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
        data={updatedDataForGraph}
        lines={[
          {
            dataKey: 'totalVulnerabilityCount',
            name: 'Total Vulnerabilities'
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
            stroke: theme.colors.yellow[400]
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
        data={updatedDataForGraph}
        lines={[
          {
            dataKey: 'totalVulnerabilityCount',
            name: 'Total'
          },
          {
            dataKey: 'vulnerabilityUnspecifiedCount',
            name: 'Unspecified',
            stroke: 'gray'
          },
          {
            dataKey: 'vulnerabilityInTriageCount',
            name: 'In Triage',
            stroke: theme.colors.cyan[400]
          },
          {
            dataKey: 'vulnerabilityAffectedCount',
            name: 'Affected',
            stroke: 'red'
          },
          {
            dataKey: 'vulnerabilityFixedCount',
            name: 'Fixed',
            stroke: 'blue'
          },
          {
            dataKey: 'vulnerabilityNotAffectedCount',
            name: 'Not Affected',
            stroke: 'green'
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
