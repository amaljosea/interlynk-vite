import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'

const VulnSeverityMetrics = gql`
  query VulnSeverityMetrics(
    $first: Int
    $after: String
    $projectNames: [String!]
    $projectGroupIds: [Uuid!]
    $sbomIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $level: OrganizationMetricLevelEnum
    $labelIds: [Uuid!]
  ) {
    dailyMetrics {
      sbomMetrics(
        first: $first
        after: $after
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
          vulnerabilityCriticalCount
          vulnerabilityHighCount
          vulnerabilityLowCount
          vulnerabilityMediumCount
          vulnerabilityUnknownSevCount
        }
      }
    }
  }
`

const VulnBySeverity = ({ filters }) => {
  const theme = useTheme()
  const { envName } = useGlobalState()
  const { version, product, duration, label } = filters || ''
  const { startDate, endDate } = duration || ''

  const { dates } = getDays({ startDate, endDate })

  const { data, loading } = useQuery(VulnSeverityMetrics, {
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

  const severityMetrics = nodes?.length
    ? Object.values(
        nodes.reduce((acc, item) => {
          const dateKey = item.date
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey ? formatDate(dateKey) : 'N/A',
              vulnerabilityCriticalCount: 0,
              vulnerabilityHighCount: 0,
              vulnerabilityMediumCount: 0,
              vulnerabilityLowCount: 0,
              vulnerabilityUnknownSevCount: 0
            }
          }

          acc[dateKey].vulnerabilityCriticalCount +=
            item.vulnerabilityCriticalCount || 0
          acc[dateKey].vulnerabilityHighCount +=
            item.vulnerabilityHighCount || 0
          acc[dateKey].vulnerabilityMediumCount +=
            item.vulnerabilityMediumCount || 0
          acc[dateKey].vulnerabilityLowCount += item.vulnerabilityLowCount || 0
          acc[dateKey].vulnerabilityUnknownSevCount +=
            item.vulnerabilityUnknownSevCount || 0

          return acc
        }, {})
      )
    : dates?.map((date) => ({
        date: date ? formatDate(date) : 'N/A',
        vulnerabilityCriticalCount: 0,
        vulnerabilityHighCount: 0,
        vulnerabilityMediumCount: 0,
        vulnerabilityLowCount: 0,
        vulnerabilityUnknownSevCount: 0
      })) || []

  const lines = [
    {
      dataKey: 'vulnerabilityCriticalCount',
      name: 'Critical',
      stroke: theme.colors.red[500]
    },
    {
      dataKey: 'vulnerabilityHighCount',
      name: 'High',
      stroke: theme.colors.orange[500]
    },
    {
      dataKey: 'vulnerabilityMediumCount',
      name: 'Medium',
      stroke: theme.colors.yellow[500]
    },
    {
      dataKey: 'vulnerabilityLowCount',
      name: 'Low',
      stroke: theme.colors.green[500]
    },
    {
      dataKey: 'vulnerabilityUnknownSevCount',
      name: 'Unknown',
      stroke: theme.colors.gray[500]
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Vulnerabilities by Severity
        </Text>
        <Text fontSize='sm'>
          Number of vulnerabilities in included versions grouped by their
          severity
        </Text>
      </Stack>
      <SingleGraph lines={lines} data={severityMetrics} />
    </Card>
  )
}

export default VulnBySeverity
