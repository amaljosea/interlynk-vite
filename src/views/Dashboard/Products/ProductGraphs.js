/* eslint-disable no-unreachable */
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis } from 'recharts'

import { Box, Flex, Text } from '@chakra-ui/react'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

const QUERY = gql`
  query Project($projectId: Uuid!) {
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

const vulnData = [
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

const policyData = [
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

export const ProductGraphs = () => {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const params = useParams()
  const productId = params.productid

  const { data, loading } = useQuery(QUERY, {
    variables: {
      projectId: productId
    }
  })

  const nodes =
    data?.project?.sbomVersions?.nodes.map((node) => {
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

  const nodesReversed = [...nodes].reverse()

  const SimpleBarChat = ({ label, dataKey, color }) => {
    return (
      <Flex flexDir={'column'} alignItems={'center'}>
        <BarChart width={200} height={40} data={nodesReversed}>
          <Bar name={`${label} Count`} dataKey={dataKey} fill={color} />
          <XAxis dataKey='name' hide />
          <Tooltip position={{ x: 100, y: -50 }} />
        </BarChart>
        <Text fontSize={'xs'} cursor={'pointer'}>
          {`${label} Trend`}
        </Text>
      </Flex>
    )
  }

  const SimpleLineChat = ({ label, data }) => {
    return (
      <Flex flexDir={'column'} alignItems={'center'}>
        <LineChart width={200} height={40} data={nodesReversed}>
          {data?.map((item) => (
            <Line
              key={item.id}
              stroke={item.stroke}
              name={item.name}
              dataKey={item.dataKey}
            />
          ))}
          <XAxis dataKey='name' hide />
          <Tooltip
            position={{ x: 100, y: label === 'Vulnerability' ? -50 : -200 }}
            wrapperStyle={{ zIndex: 9999 }}
          />
        </LineChart>
        <Text cursor={'pointer'} fontSize={'xs'}>
          {`${label} Trend`}
        </Text>
      </Flex>
    )
  }

  if (loading) {
    return <Box mt={8}>Loading...</Box>
  }

  if (!shouldShowDemoFeatures) {
    return null
  }
  return (
    <Box display='flex' justifyContent='space-between' mt={8}>
      <Flex flexWrap={'wrap'} alignItems={'center'} gap={12}>
        <SimpleBarChat
          color='#3182ce'
          label={'Component'}
          dataKey='stats.compCount'
        />
        <SimpleBarChat
          color='#3182ce'
          label={'License'}
          dataKey='stats.compLicenseCount'
        />
        <SimpleLineChat data={vulnData} label={'Vulnerability'} />
        <SimpleLineChat data={policyData} label={'Policy'} />
      </Flex>
      <Box>
        {/* <Box>
          <LineChart width={100} height={40} data={data3}>
            <Line type='monotone' dataKey='pv' stroke='#8884d8' />
          </LineChart>
          Quality score trend
        </Box>
        <Box>
          <LineChart width={100} height={40} data={data2}>
            <Line type='monotone' dataKey='uv' stroke='black' />
          </LineChart>
          Health score trend
        </Box> */}
      </Box>
    </Box>
  )
}
