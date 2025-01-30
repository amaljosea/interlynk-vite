import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

const PatchVelocityMetrics = gql`
  query PatchVelocityMetrics(
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

const PatchVelocity = ({ filters }) => {
  const theme = useTheme()

  const { product, label } = filters || ''
  const { startDate, endDate } = filters?.duration || {}

  const { dates } = getDays({ startDate, endDate })

  const { data, loading } = useQuery(PatchVelocityMetrics, {
    skip: startDate && endDate ? false : true,
    variables: {
      endDate,
      startDate,
      first: 200,
      labelIds: label?.length > 0 ? label : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }
  })
  const { projectVulnMetrics } = data?.dailyMetrics || ''

  const processVulnMetricsByDate = (data) => {
    if (!data || !Array.isArray(data?.nodes)) {
      return []
    }

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

    data?.nodes?.forEach((node) => {
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

  const vulnMetrics = processVulnMetricsByDate(projectVulnMetrics)

  const lines = [
    {
      dataKey: 'statusAgePresentAverage',
      name: 'Identified (Average Days)',
      stroke: theme?.colors?.red[400]
    },
    {
      dataKey: 'statusAgeResolvedAverage',
      name: 'Patch Velocity (Average Days)',
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
