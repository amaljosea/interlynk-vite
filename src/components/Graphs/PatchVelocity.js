import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'

import { Stack, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import useFetchAllNodes from 'hooks/useFetchAllNodes'

const PatchVelocityMetrics = gql`
  query PatchVelocityMetrics(
    $first: Int
    $after: String
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $vulnIds: [Uuid!]
    $labelIds: [Uuid!]
  ) {
    dailyMetrics {
      projectVulnMetrics(
        first: $first
        after: $after
        projectIds: $projectIds
        projectGroupIds: $projectGroupIds
        startDate: $startDate
        endDate: $endDate
        vulnIds: $vulnIds
        projectGroupLabelIds: $labelIds
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
        nodes {
          date
          statusAgeAffected
          statusAgeFixed
          statusAgeInTriage
          statusAgeNotAffected
          statusAgeResolved
          statusAgeUnspecified
        }
      }
    }
  }
`

const PatchVelocity = ({ filters }) => {
  const theme = useTheme()

  const { product, label } = filters || {}
  const { startDate, endDate } = filters?.duration || {}

  const variables = useMemo(
    () => ({
      endDate,
      startDate,
      labelIds: label?.length > 0 ? label : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }),
    [endDate, startDate, label, product]
  )

  const { data, loading } = useFetchAllNodes({
    query: PatchVelocityMetrics,
    variables,
    selector: 'dailyMetrics.projectVulnMetrics',
    skip: !startDate || !endDate
  })

  const processVulnMetricsByDate = (data) => {
    const nodes = data || []

    // Aggregate metrics by date
    const aggregatedMetrics = nodes?.reduce((acc, entry) => {
      const { date, statusAgeAffected, statusAgeFixed } = entry
      if (!acc[date]) {
        acc[date] = { affected: 0, fixed: 0 }
      }
      acc[date].affected += statusAgeAffected || 0
      acc[date].fixed += statusAgeFixed || 0
      return acc
    }, {})

    let cumulativeAffected = 0
    let cumulativeFixed = 0
    const patchVelocity = []

    Object.keys(aggregatedMetrics)
      .sort()
      .forEach((date) => {
        cumulativeAffected += aggregatedMetrics[date].affected
        cumulativeFixed += aggregatedMetrics[date].fixed

        const velocity =
          cumulativeFixed > 0
            ? parseFloat(cumulativeAffected / cumulativeFixed).toFixed(2)
            : null

        patchVelocity.push({
          date,
          cumulativeAffected,
          cumulativeFixed,
          velocity
        })
      })

    return patchVelocity
  }

  const vulnMetrics = processVulnMetricsByDate(data)

  const lines = [
    {
      dataKey: 'velocity',
      name: 'Patch Velocity',
      stroke: theme?.colors?.green[500]
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Patch Velocity
        </Text>
        <Text fontSize='sm'>
          Duration from vulnerability identification to when it is updated or
          patched
        </Text>
      </Stack>
      <SingleGraph data={vulnMetrics} lines={lines} averages={true} />
    </Card>
  )
}

export default PatchVelocity
