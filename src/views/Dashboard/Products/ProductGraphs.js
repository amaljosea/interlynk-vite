/* eslint-disable no-unreachable */
import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis } from 'recharts'
import { shouldShowDemoFeatures } from 'utils/shouldShowDemoFeatures'

import { Box, Text } from '@chakra-ui/react'

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
export const ProductGraphs = () => {
  // temp setup
  // return null

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

  console.l

  if (loading) {
    return 'Loading...'
  }

  if (!shouldShowDemoFeatures()) {
    return null
  }
  return (
    <Box display='flex' justifyContent='space-between'>
      <Box>
        <Box>
          <BarChart width={100} height={40} data={nodesReversed}>
            <Bar
              name='Component count'
              dataKey='stats.compCount'
              fill='#3182ce'
            />
            <XAxis dataKey='name' hide />
            <Tooltip position={{ x: 100, y: -50 }} />
          </BarChart>
          <Text>Component trend</Text>
        </Box>
        <Box>
          <BarChart width={100} height={40} data={nodesReversed}>
            <Bar
              dataKey='stats.compLicenseCount'
              fill='#3182ce'
              name='License count'
            />
            <XAxis dataKey='name' hide />
            <Tooltip position={{ x: 100, y: -50 }} />
          </BarChart>
          <Text>License trend</Text>
        </Box>
      </Box>
      <Box>
        <Box>
          <LineChart width={100} height={40} data={nodesReversed}>
            <Line
              name='Critical'
              dataKey='stats.vulnStats.critical'
              stroke='red'
            />
            <Line name='High' dataKey='stats.vulnStats.high' stroke='orange' />
            <Line
              name='Medium'
              dataKey='stats.vulnStats.medium'
              stroke='#cbbb08'
            />
            <Line name='Low' dataKey='stats.vulnStats.low' stroke='green' />
            <Line
              name='Unknown'
              dataKey='stats.vulnStats.unknown'
              stroke='gray'
            />
            <XAxis dataKey='name' hide />
            <Tooltip position={{ x: 100, y: -50 }} />
          </LineChart>
          Vulnerability trend
        </Box>
        <Box>
          <LineChart width={100} height={40} data={nodesReversed}>
            <Line
              name='Failed'
              dataKey='policyResultMetrics.failedCount'
              stroke='red'
            />
            <Line
              name='Warn'
              dataKey='policyResultMetrics.warnCount'
              stroke='#cbbb08'
            />
            <Line
              name='Inform'
              dataKey='policyResultMetrics.informCount'
              stroke='blue'
            />
            <Line
              name='Passed'
              dataKey='policyResultMetrics.passedCount'
              stroke='green'
            />
            <Line
              name='Skipped'
              dataKey='policyResultMetrics.skippedCount'
              stroke='orange'
            />
            <Line
              name='Error'
              dataKey='policyResultMetrics.errorCount'
              stroke='gray'
            />
            <XAxis dataKey='name' hide />
            <Tooltip position={{ x: 100, y: -200 }} />
          </LineChart>
          Policy trend
        </Box>
      </Box>
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
