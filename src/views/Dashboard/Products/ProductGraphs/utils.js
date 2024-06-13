import { gql } from '@apollo/client'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import { Flex, Text } from '@chakra-ui/react'

export const SBOM_LIST_WITH_DATA_QUERY = gql`
  query SbomListWithGraphData($projectId: Uuid!) {
    project(id: $projectId) {
      id
      sbomVersions(
        first: 5
        orderBy: { field: SBOMS_CREATED_AT, direction: DESC }
      ) {
        nodes {
          id
          projectVersion
          stats {
            compCount
            compLicenseCount
            vulnStats
          }
          policyResultMetrics {
            skippedCount
            failedCount
            errorCount
            passedCount
            informCount
            warnCount
          }
        }
      }
    }
  }
`

const tooltipCustom = (
  <Tooltip position={{ x: 0, y: 70 }} wrapperStyle={{ zIndex: 9999 }} />
)

export const SimpleBarChat = ({ label, dataKey, color, data }) => {
  return (
    <Flex flexDir={'column'} alignItems={'center'}>
      <BarChart width={200} height={40} data={data}>
        <Bar name={`${label} Count`} dataKey={dataKey} fill={color} />
        <XAxis dataKey='name' hide />
        {tooltipCustom}
      </BarChart>
      <Text fontSize={'xs'} cursor={'pointer'}>
        {`${label} Trend`}
      </Text>
    </Flex>
  )
}

export const SimpleLineChat = ({ label, config, data }) => {
  return (
    <Flex flexDir={'column'} alignItems={'center'}>
      <LineChart width={200} height={40} data={data}>
        {config?.map((item) => (
          <Line
            key={item.id}
            stroke={item.stroke}
            name={item.name}
            dataKey={item.dataKey}
          />
        ))}
        <YAxis hide tickFormatter={(value) => value.toFixed(2)} />
        <XAxis dataKey='name' hide />
        {tooltipCustom}
      </LineChart>
      <Text cursor={'pointer'} fontSize={'xs'}>
        {`${label} Trend`}
      </Text>
    </Flex>
  )
}

export const vulnConfig = [
  {
    id: 1,
    name: 'Critical',
    dataKey: 'stats.vulnStats.critical',
    stroke: 'red'
  },
  {
    id: 2,
    name: 'High',
    dataKey: 'stats.vulnStats.high',
    stroke: 'orange'
  },
  {
    id: 3,
    name: 'Medium',
    dataKey: 'stats.vulnStats.medium',
    stroke: '#cbbb08'
  },
  {
    id: 4,
    name: 'Low',
    dataKey: 'stats.vulnStats.low',
    stroke: 'green'
  },
  {
    id: 5,
    name: 'Unknown',
    dataKey: 'stats.vulnStats.unknown',
    stroke: 'gray'
  }
]

export const policyConfig = [
  {
    id: 1,
    name: 'Failed',
    dataKey: 'policyResultMetrics.failedCount',
    stroke: 'red'
  },
  {
    id: 2,
    name: 'Warn',
    dataKey: 'policyResultMetrics.warnCount',
    stroke: '#cbbb08'
  },
  {
    id: 3,
    name: 'Inform',
    dataKey: 'policyResultMetrics.informCount',
    stroke: 'blue'
  },
  {
    id: 4,
    name: 'Passed',
    dataKey: 'policyResultMetrics.passedCount',
    stroke: 'green'
  },
  {
    id: 5,
    name: 'Skipped',
    dataKey: 'policyResultMetrics.skippedCount',
    stroke: 'orange'
  },
  {
    id: 6,
    name: 'Error',
    dataKey: 'policyResultMetrics.errorCount',
    stroke: 'gray'
  }
]

export const formatDataForGraph = (items) => {
  const itemsFormatted =
    items.map((node) => {
      return {
        id: node.id,
        name: node.projectVersion,
        stats: {
          compCount: node.stats.compCount,
          compLicenseCount: node.stats.compLicenseCount,
          vulnStats: {
            high: node.stats.vulnStats.high || 0,
            medium: node.stats.vulnStats.medium || 0,
            unknown: node.stats.vulnStats.unknown || 0,
            critical: node.stats.vulnStats.critical || 0,
            low: node.stats.vulnStats.low || 0
          }
        },
        policyResultMetrics: {
          skippedCount: node.policyResultMetrics.skippedCount || 0,
          failedCount: node.policyResultMetrics.failedCount || 0,
          errorCount: node.policyResultMetrics.errorCount || 0,
          passedCount: node.policyResultMetrics.passedCount || 0,
          informCount: node.policyResultMetrics.informCount || 0,
          warnCount: node.policyResultMetrics.warnCount || 0
        }
      }
    }) || []

  const itemsFormattedAndReversed = [...itemsFormatted].reverse()

  return itemsFormattedAndReversed
}
