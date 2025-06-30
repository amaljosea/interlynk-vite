import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'

import { useTheme } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import useDateRange from 'hooks/useDateRange'
import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useGlobalState } from 'hooks/useGlobalState'

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
    $lifecycle: [ProductLifecycleStageEnum!]
  ) {
    dailyMetrics {
      projectVulnMetrics(
        first: $first
        after: $after
        lifecycle: $lifecycle
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
        }
      }
    }
  }
`

const PatchVelocity = () => {
  const theme = useTheme()
  const { analyticsState } = useGlobalState()
  const { startDate, endDate } = useDateRange()
  const { product, label, lifecycle } = analyticsState || {}

  const { dates } = getDays({ startDate, endDate })

  const variables = useMemo(
    () => ({
      endDate,
      startDate,
      labelIds: label?.length > 0 ? label : [],
      lifecycle: lifecycle?.length > 0 ? lifecycle?.map((p) => p.value) : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }),
    [endDate, label, lifecycle, product, startDate]
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

  const defaultData = dates?.map((date) => ({
    date,
    velocity: 0,
    cumulativeFixed: 0,
    cumulativeAffected: 0
  }))

  const vulnMetrics =
    data?.length > 0 ? processVulnMetricsByDate(data) : defaultData

  const lines = [
    {
      dataKey: 'velocity',
      name: 'Patch Velocity',
      stroke: theme?.colors?.green[500]
    }
  ]

  if (loading) return <LynkLoader />

  return <SingleGraph data={vulnMetrics} lines={lines} averages={true} />
}

export default PatchVelocity
