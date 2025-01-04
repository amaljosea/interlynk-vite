import { Box, Grid, Text, useTheme } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { SingleGraph } from './SingleGraph'

export const GraphUi = ({ dataForGraph, prodMetrics, prodVulnMetrics }) => {
  const theme = useTheme()
  const { primaryBlueText, grayText } = useThemeColor([
    'primaryBlueText',
    'grayText'
  ])

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
      mt={4}
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
        <Text fontSize='sm' color={grayText} mb={4}>
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
        <Text fontSize='sm' color={grayText} mb={4}>
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
        <Text fontSize='sm' color={grayText} mb={4}>
          Number of vulnerabilities in included versions grouped by their
          severity
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'totalVulnerabilityCount',
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
          syncId={'vulns'}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
          Vulnerabilities by Status
        </Text>
        <Text fontSize='sm' color={grayText} mb={4}>
          Number of vulnerabilities in included versions grouped by their
          vulnerabilty status
        </Text>
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
          syncId={'vulns'}
        />
      </Box>

      <Box textAlign='center'>
        <Text fontSize='lg' fontWeight='bold' mb={2}>
          Defect Density
        </Text>
        <Text fontSize='sm' color={grayText} mb={4}>
          Percentage of identified vulnerabilities that are updated or patched
        </Text>
        <SingleGraph
          data={prodMetrics}
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
        <Text fontSize='sm' color={grayText} mb={4}>
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
        <Text fontSize='sm' color={grayText} mb={4}>
          Duration from when an update or patch is available to complete
          implementation in devices deployed in the field, to the extent known
        </Text>
        <SingleGraph
          data={updatedDataForGraph}
          lines={[
            {
              dataKey: 'statusAgeUnspecified',
              name: 'Unspecified',
              stroke: 'gray'
            },
            {
              dataKey: 'statusAgeInTriage',
              name: 'In Triage',
              stroke: theme.colors.cyan[400]
            },
            {
              dataKey: 'statusAgeAffected',
              name: 'Affected',
              stroke: 'red'
            },
            {
              dataKey: 'statusAgeFixed',
              name: 'Fixed',
              stroke: 'blue'
            },
            {
              dataKey: 'statusAgeNotAffected',
              name: 'Not Affected',
              stroke: 'green'
            }
          ]}
        />
      </Box>
    </Grid>
  )
}
