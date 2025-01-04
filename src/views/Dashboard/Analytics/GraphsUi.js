import { Box, Grid, Text, useTheme } from '@chakra-ui/react'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph, projectMetrics, prodVulnMetrics }) => {
  const theme = useTheme()

  const updatedDataForGraph = dataForGraph.map((item) => {
    const {
      vulnerabilityCount,
      vulnerabilityNotAffectedCount,
      vulnerabilityUnspecifiedCount
    } = item
    const totalVulnerabilityCount =
      vulnerabilityCount + vulnerabilityNotAffectedCount

    return {
      ...item,
      totalVulnerabilityCount,
      updatedVulnerabilityRate:
        totalVulnerabilityCount === 0
          ? 0
          : ((totalVulnerabilityCount - vulnerabilityUnspecifiedCount) * 100) /
            totalVulnerabilityCount
    }
  })

  return (
    <Grid
      gap={12}
      width={'100%'}
      alignItems={'center'}
      justifyContent='center'
      templateColumns={`repeat(2, 1fr)`}
    >
      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
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
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
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
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
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
              stroke: theme.colors.gray[50]
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
          syncId={'vulns'}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
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
              stroke: theme.colors.gray[50]
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
          syncId={'vulns'}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
          Defect Density
        </Text>
        <Text fontSize='sm' mb={4}>
          Percentage of identified vulnerabilities that are updated or patched
        </Text>
        <SingleGraph
          data={projectMetrics}
          lines={[
            {
              dataKey: 'defectDensity',
              name: 'Defect Density'
            }
          ]}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
          Patch Velocity
        </Text>
        <Text fontSize='sm' mb={4}>
          Duration from vulnerability identification to when it is updated or
          patched
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'updatedVulnerabilityRate',
              name: 'Patch Velocity'
            }
          ]}
          percentage={true}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
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
      </Box>
    </Grid>
  )
}
