/* eslint-disable no-unreachable */
import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'
import { useParams } from 'react-router-dom'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import { Box, Flex, Text } from '@chakra-ui/react'

import { calculateHealthScore } from 'hooks/useSbomScores'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

const SBOM_LIST_WITH_DATA_QUERY = gql`
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

const getSingleQuery = ({ sbomId, productId, index }) => {
  const query = `
   sbom${index + 1} : sbom(projectId: "${productId}", sbomId: "${sbomId}") {
      id
      projectVersion
      components(sbomId: "${sbomId}", first: 999999999) {
        totalCount
        nodes {
          id
          name
          version
        }
      }
    }
  `

  return query
}

const getLatestLatestSbomWithComponentsQuery = ({ sbomIds, productId }) => {
  return sbomIds.reduce((acc, sbomId, index) => {
    return (
      acc +
      getSingleQuery({
        sbomId,
        productId,
        index
      })
    )
  }, '')
}

const tooltipCustom = (
  <Tooltip position={{ x: 0, y: 70 }} wrapperStyle={{ zIndex: 9999 }} />
)

const SimpleBarChat = ({ label, dataKey, color, data }) => {
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

const SimpleLineChat = ({ label, config, data }) => {
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

const vulnConfig = [
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

const policyConfig = [
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

  const { data, loading, error } = useQuery(SBOM_LIST_WITH_DATA_QUERY, {
    variables: {
      projectId: productId
    }
  })

  const items = data?.project?.sbomVersions?.nodes
  const count = items?.length
  const sbomIds = items?.map((i) => i.id)

  const dynamicQuery = data
    ? getLatestLatestSbomWithComponentsQuery({ sbomIds, productId })
    : ''

  const QUERY_QUALITY_SCORE = gql`
  query Organization($sbomIds: [ID!]!) {
    complianceReports(sbomIds: $sbomIds, reportFormat: NTIA) {
      nodes {
        score
      }
    }
    ${dynamicQuery}
  }
`

  const {
    data: dataQs,
    loading: loadingQs,
    error: errorQs
  } = useQuery(QUERY_QUALITY_SCORE, {
    skip: !data,
    variables: {
      sbomIds
    }
  })

  if (error || errorQs) {
    return 'Error'
  }

  if (loading || loadingQs) {
    return <Box mt={8}>Loading...</Box>
  }

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

  const formattedScores =
    dataQs?.complianceReports?.nodes.map((i) => ({
      score: round(i.score, 2)
    })) || []

  const nodesReversed = [...nodes].reverse()
  const nodesBReversed = [...(formattedScores || [])].reverse()

  if (count <= 2) {
    return null
  }

  const healthScore = dataQs
    ? nodesReversed.reduce((acc, item, index) => {
        const sbomWithData = dataQs[`sbom${index + 1}`]
        const { healthScore } = calculateHealthScore(sbomWithData)
        return [
          ...acc,
          { name: sbomWithData.projectVersion, healthScore: healthScore }
        ]
      }, [])
    : []

  const healthScoreReversed = [...healthScore].reverse()
  const scoreFinal = healthScoreReversed.map((item, index) => ({
    ...item,
    qualityScore: nodesBReversed[index].score
  }))

  return (
    <Box display='flex' justifyContent='center' mt={8}>
      <Flex flexWrap={'wrap'} alignItems={'center'} gap={12}>
        <SimpleBarChat
          color='#3182ce'
          label={'Component'}
          dataKey='stats.compCount'
          data={nodesReversed}
        />
        <SimpleBarChat
          color='#3182ce'
          label={'License'}
          dataKey='stats.compLicenseCount'
          data={nodesReversed}
        />
        <SimpleLineChat
          config={vulnConfig}
          data={nodesReversed}
          label={'Vulnerability'}
        />
        <SimpleLineChat
          config={policyConfig}
          data={nodesReversed}
          label={'Policy'}
        />
        <SimpleBarChat
          color='#3182ce'
          label={'Quality Score'}
          dataKey='qualityScore'
          data={scoreFinal}
        />
        {shouldShowDemoFeatures && (
          <SimpleBarChat
            color='#3182ce'
            label={'Health Score'}
            dataKey='healthScore'
            data={scoreFinal}
          />
        )}
      </Flex>
    </Box>
  )
}
