import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { useTheme } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import useDateRange from 'hooks/useDateRange'
import useFetchAllNodes from 'hooks/useFetchAllNodes'

const IdentityVelocityMetrics = gql`
  query IdentityVelocityMetrics(
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

const IdentityVelocity = () => {
  const theme = useTheme()
  const { startDate, endDate } = useDateRange()

  const { dates } = getDays({ startDate, endDate })

  const variables = useMemo(
    () => ({
      endDate,
      startDate
      // labelIds: label?.length > 0 ? label : [],
      // projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }),
    [endDate, startDate]
  )

  const { data, loading } = useFetchAllNodes({
    query: IdentityVelocityMetrics,
    variables,
    selector: 'dailyMetrics.projectVulnMetrics',
    skip: !startDate || !endDate
  })

  const processVulnMetricsByDate = (data) => {
    const result = {}

    dates.forEach((date) => {
      result[date] = {
        date,
        statusCount: 0,
        statusAgePresent: 0,
        statusAgeResolved: 0,
        statusAgePresentAverage: 0.0,
        statusAgeResolvedAverage: 0.0
      }
    })

    data?.forEach((node) => {
      const {
        date,
        statusAgeAffected = 0,
        statusAgeResolved = 0,
        statusAgeUnspecified = 0,
        statusAgeInTriage = 0
      } = node

      if (!result[date]) {
        result[date] = {
          date,
          statusCount: 0,
          statusAgePresent: 0,
          statusAgeResolved: 0,
          statusAgePresentAverage: 0.0,
          statusAgeResolvedAverage: 0.0
        }
      }
      result[date].statusCount += 1
      if (
        statusAgeUnspecified > 0 ||
        statusAgeAffected > 0 ||
        statusAgeInTriage > 0
      ) {
        result[date].statusAgePresent +=
          statusAgeUnspecified + statusAgeAffected + statusAgeInTriage
      } else {
        result[date].statusAgeResolved += statusAgeResolved
      }
    })

    return Object.values(result).map((entry) => ({
      date: entry?.date ? formatDate(entry?.date) : 'N/A',
      statusAgePresent: entry?.statusAgePresent,
      statusAgeResolved: entry?.statusAgeResolved,
      statusCount: entry?.statusCount,
      statusAgePresentAverage:
        entry?.statusCount === 0
          ? 0
          : entry?.statusAgePresent / entry?.statusCount,
      statusAgeResolvedAverage:
        entry?.statusCount === 0
          ? 0
          : entry?.statusAgeResolved / entry?.statusCount
    }))
  }

  const vulnMetrics = processVulnMetricsByDate(data)

  const lines = [
    {
      dataKey: 'statusAgePresentAverage',
      name: 'Average number of days until resolution',
      stroke: theme.colors.red[500]
    }
  ]

  if (loading) return <LynkLoader />

  return <SingleGraph data={vulnMetrics} lines={lines} averages={true} />
}

export default IdentityVelocity
