import { Grid, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph, prodVulnMetrics }) => {
  const theme = useTheme()

  const updatedDataForGraph = dataForGraph.map((item) => {
    const {
      vulnerabilityCount,
      vulnerabilityNotAffectedCount,
      vulnerabilityAffectedCount,
      vulnerabilityFixedCount
    } = item
    const totalVulnerabilityCount =
      vulnerabilityCount + vulnerabilityNotAffectedCount

    return {
      ...item,
      totalVulnerabilityCount,
      updatedVulnerabilityRate:
        totalVulnerabilityCount === 0
          ? 0
          : ((vulnerabilityNotAffectedCount +
              vulnerabilityAffectedCount +
              vulnerabilityFixedCount) *
              100) /
            totalVulnerabilityCount
    }
  })

  return (
    <Grid
      gap={6}
      width={'100%'}
      alignItems={'center'}
      justifyContent='center'
      templateColumns={`repeat(2, 1fr)`}
    >
      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Component Count
        </Text>
        <Text fontSize='sm' mb={4}>
          Number of components in included versions over time
        </Text>
        <SingleGraph
          data={dataForGraph}
          lines={[
            {
              dataKey: 'componentsCount',
              name: 'Component Count'
            }
          ]}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          License Count
        </Text>
        <Text fontSize='sm' mb={4}>
          Number of unique licenses included in versions over time
        </Text>
        <SingleGraph
          data={dataForGraph}
          lines={[
            {
              dataKey: 'licensesCount',
              name: 'License Count'
            }
          ]}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Vulnerabilities by Severity
        </Text>
        <Text fontSize='sm' mb={4}>
          Number of vulnerabilities in included versions grouped by their
          severity
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'totalVulnerabilityCount',
              name: 'Total',
              stroke: theme.colors.gray[500]
            },
            {
              dataKey: 'vulnerabilityCriticalCount',
              name: 'Critical',
              stroke: theme.colors.red[500]
            },
            {
              dataKey: 'vulnerabilityHighCount',
              name: 'High',
              stroke: theme.colors.orange[500]
            },
            {
              dataKey: 'vulnerabilityMediumCount',
              name: 'Medium',
              stroke: theme.colors.yellow[500]
            },
            {
              dataKey: 'vulnerabilityLowCount',
              name: 'Low',
              stroke: theme.colors.green[500]
            },
            {
              dataKey: 'vulnerabilityUnknownSevCount',
              name: 'Unknown',
              stroke: theme.colors.gray[500]
            }
          ]}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Vulnerabilities by Status
        </Text>
        <Text fontSize='sm' mb={4}>
          Number of vulnerabilities in included versions grouped by their
          vulnerabilty status
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'totalVulnerabilityCount',
              name: 'Total',
              stroke: theme.colors.gray[500]
            },
            {
              dataKey: 'vulnerabilityUnspecifiedCount',
              name: 'Unspecified',
              stroke: theme.colors.gray[500]
            },
            {
              dataKey: 'vulnerabilityInTriageCount',
              name: 'In Triage',
              stroke: theme.colors.cyan[500]
            },
            {
              dataKey: 'vulnerabilityAffectedCount',
              name: 'Affected',
              stroke: theme.colors.red[500]
            },
            {
              dataKey: 'vulnerabilityFixedCount',
              name: 'Fixed',
              stroke: theme.colors.blue[500]
            },
            {
              dataKey: 'vulnerabilityNotAffectedCount',
              name: 'Not Affected',
              stroke: theme.colors.green[500]
            }
          ]}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Patch Velocity
        </Text>
        <Text fontSize='sm' mb={4}>
          Duration from vulnerability identification to when it is updated or
          patched
        </Text>
        <SingleGraph
          data={prodVulnMetrics}
          lines={[
            {
              dataKey: 'statusAgePresentAverage',
              name: 'Identified (Average Days)',
              stroke: theme.colors.red[400]
            },
            {
              dataKey: 'statusAgeResolvedAverage',
              name: 'Patch Velocity (Average Days)',
              stroke: theme.colors.green[500]
            }
          ]}
          averages={true}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Defect Density
        </Text>
        <Text fontSize='sm' mb={4}>
          Percentage of identified vulnerabilities that are updated or patched
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'updatedVulnerabilityRate',
              name: 'Defect Density'
            }
          ]}
          percentage={true}
        />
      </Card>

      <Card textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={1}>
          Deploy Velocity
        </Text>
        <Text fontSize='sm' mb={4}>
          Duration from when an update or patch is available to complete
          implementation in devices deployed in the field, to the extent known
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'statusAgeUnspecified',
              name: 'Unspecified',
              stroke: theme.colors.gray[500]
            },
            {
              dataKey: 'statusAgeInTriage',
              name: 'In Triage',
              stroke: theme.colors.cyan[500]
            },
            {
              dataKey: 'statusAgeAffected',
              name: 'Affected',
              stroke: theme.colors.red[500]
            },
            {
              dataKey: 'statusAgeFixed',
              name: 'Fixed',
              stroke: theme.colors.blue[500]
            },
            {
              dataKey: 'statusAgeNotAffected',
              name: 'Not Affected',
              stroke: theme.colors.green[500]
            }
          ]}
        />
      </Card>
    </Grid>
  )
}
