import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { CardBody, useTheme } from '@chakra-ui/react'

import LynkLoader from 'components/Misc/LynkLoader'

import useDateRange from 'hooks/useDateRange'
import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useGlobalState } from 'hooks/useGlobalState'

const DeployVelocityMetrics = gql`
  query DeployVelocityMetrics(
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

const DeployVelocity = () => {
  const theme = useTheme()
  const { envName, analyticsState } = useGlobalState()
  const { startDate, endDate } = useDateRange()
  const { product, label, version } = analyticsState || {}

  const { dates } = getDays({ startDate, endDate })

  const variables = useMemo(
    () => ({
      endDate,
      startDate,
      projectNames: [envName],
      labelIds: label?.length > 0 ? label : [],
      sbomIds: version?.length > 0 ? version?.map((p) => p.value) : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }),
    [endDate, startDate, envName, label, version, product]
  )

  const { data, loading } = useFetchAllNodes({
    query: DeployVelocityMetrics,
    variables,
    selector: 'dailyMetrics.projectVulnMetrics',
    skip: !startDate || !endDate
  })

  const deployMetrics = data?.length
    ? Object.values(
        data.reduce((acc, item) => {
          const dateKey = item.date
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey ? formatDate(dateKey) : 'N/A',
              statusAgeUnspecified: 0,
              statusAgeInTriage: 0,
              statusAgeAffected: 0,
              statusAgeFixed: 0,
              statusAgeNotAffected: 0
            }
          }

          acc[dateKey].statusAgeUnspecified += item.statusAgeUnspecified || 0
          acc[dateKey].statusAgeInTriage += item.statusAgeInTriage || 0
          acc[dateKey].statusAgeAffected += item.statusAgeAffected || 0
          acc[dateKey].statusAgeFixed += item.statusAgeFixed || 0
          acc[dateKey].statusAgeNotAffected += item.statusAgeNotAffected || 0

          return acc
        }, {})
      )
    : dates?.map((date) => ({
        date: date ? formatDate(date) : 'N/A',
        statusAgeUnspecified: 0,
        statusAgeInTriage: 0,
        statusAgeAffected: 0,
        statusAgeFixed: 0,
        statusAgeNotAffected: 0
      })) || []

  const lines = [
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
  ]

  if (loading) return <LynkLoader />

  return (
    <CardBody py={4}>
      <SingleGraph data={deployMetrics} lines={lines} />
    </CardBody>
  )
}

export default DeployVelocity
