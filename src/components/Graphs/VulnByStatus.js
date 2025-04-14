import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { useTheme } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import useDateRange from 'hooks/useDateRange'
import { useGlobalState } from 'hooks/useGlobalState'

const VulnStatusMetrics = gql`
  query VulnStatusMetrics(
    $first: Int
    $projectNames: [String!]
    $projectGroupIds: [Uuid!]
    $sbomIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $labelIds: [Uuid!]
    $level: OrganizationMetricLevelEnum
  ) {
    dailyMetrics {
      sbomMetrics(
        first: $first
        level: $level
        projectNames: $projectNames
        projectGroupIds: $projectGroupIds
        sbomIds: $sbomIds
        startDate: $startDate
        endDate: $endDate
        projectGroupLabelIds: $labelIds
      ) {
        nodes {
          date
          vulnerabilityAffectedCount
          vulnerabilityFixedCount
          vulnerabilityInTriageCount
          vulnerabilityNotAffectedCount
          vulnerabilityUnspecifiedCount
        }
      }
    }
  }
`

const VulnByStatus = () => {
  const theme = useTheme()
  const { envName, analyticsState } = useGlobalState()
  const { startDate, endDate } = useDateRange()
  const { product, label, version } = analyticsState || {}

  const { dates } = getDays({ startDate, endDate })

  const { data, loading } = useQuery(VulnStatusMetrics, {
    skip: startDate && endDate ? false : true,
    variables: {
      endDate,
      startDate,
      first: 200,
      projectNames: [envName],
      labelIds: label?.length > 0 ? label : [],
      sbomIds: version?.length > 0 ? version?.map((p) => p.value) : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }
  })

  const { nodes } = data?.dailyMetrics?.sbomMetrics || ''

  const statusMetrics = nodes?.length
    ? Object.values(
        nodes.reduce((acc, item) => {
          const dateKey = item.date
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey ? formatDate(dateKey) : 'N/A',
              vulnerabilityInTriageCount: 0,
              vulnerabilityAffectedCount: 0,
              vulnerabilityNotAffectedCount: 0,
              vulnerabilityFixedCount: 0,
              vulnerabilityUnspecifiedCount: 0
            }
          }

          acc[dateKey].vulnerabilityInTriageCount +=
            item.vulnerabilityInTriageCount || 0
          acc[dateKey].vulnerabilityAffectedCount +=
            item.vulnerabilityAffectedCount || 0
          acc[dateKey].vulnerabilityNotAffectedCount +=
            item.vulnerabilityNotAffectedCount || 0
          acc[dateKey].vulnerabilityFixedCount +=
            item.vulnerabilityFixedCount || 0
          acc[dateKey].vulnerabilityUnspecifiedCount +=
            item.vulnerabilityUnspecifiedCount || 0

          return acc
        }, {})
      )
    : dates?.map((date) => ({
        date: date ? formatDate(date) : 'N/A',
        vulnerabilityInTriageCount: 0,
        vulnerabilityAffectedCount: 0,
        vulnerabilityNotAffectedCount: 0,
        vulnerabilityFixedCount: 0,
        vulnerabilityUnspecifiedCount: 0
      })) || []

  const lines = [
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
  ]

  if (loading) return <LynkLoader />

  return <SingleGraph lines={lines} data={statusMetrics} />
}

export default VulnByStatus
