import { gql } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

const DeployVelocityMetrics = gql`
  query DeployVelocityMetrics(
    $first: Int
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
        projectIds: $projectIds
        projectGroupIds: $projectGroupIds
        startDate: $startDate
        endDate: $endDate
        vulnIds: $vulnIds
        projectGroupLabelIds: $labelIds
      ) {
        totalCount
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

const DeployVelocity = ({ filters }) => {
  const theme = useTheme()
  const { envName } = useGlobalState()
  const { version, product, duration, label } = filters || ''
  const { startDate, endDate } = duration || ''

  const { dates } = getDays({ startDate, endDate })

  const { nodes, loading } = usePaginatedQuery(DeployVelocityMetrics, {
    skip: startDate && endDate ? false : true,
    selector: 'dailyMetrics.projectVulnMetrics',
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

  const deployMetrics = nodes?.length
    ? Object.values(
        nodes.reduce((acc, item) => {
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
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Deploy Velocity
        </Text>
        <Text fontSize='sm'>
          Duration from when an update or patch is available to complete
          implementation in devices deployed in the field, to the extent known
        </Text>
      </Stack>
      <SingleGraph data={deployMetrics} lines={lines} />
    </Card>
  )
}

export default DeployVelocity
