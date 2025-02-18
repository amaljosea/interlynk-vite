import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text, useTheme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import useFetchAllNodes from 'hooks/useFetchAllNodes'

const VulnAgeMetrics = gql`
  query VulnAgeMetrics(
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

const VulnAge = ({ filters }) => {
  const theme = useTheme()

  const { product, label } = filters || ''
  const { startDate, endDate } = filters?.duration || {}

  const { dates } = getDays({ startDate, endDate })

  const variables = useMemo(
    () => ({
      endDate,
      startDate,
      labelIds: label?.length > 0 ? label : [],
      projectGroupIds: product?.length > 0 ? product?.map((p) => p.value) : []
    }),
    [endDate, startDate, label, product]
  )

  const { data: nodes, loading } = useFetchAllNodes({
    query: VulnAgeMetrics,
    variables,
    selector: 'dailyMetrics.projectVulnMetrics',
    skip: !startDate || !endDate
  })

  const processVulnMetricsByDate = (nodes) => {
    const result = {}

    dates.forEach((date) => {
      result[date] = {
        date,
        statusCount: 0,
        statusAgePresent: 0
      }
    })

    nodes?.forEach((node) => {
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
          statusAgePresent: 0
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
        result[date].statusAgeResolved =
          (result[date].statusAgeResolved || 0) + statusAgeResolved
      }
    })

    return Object.values(result).map((entry) => ({
      date: entry?.date ? formatDate(entry?.date) : 'N/A',
      statusAgePresent: entry?.statusAgePresent
    }))
  }

  const ageMetrics = processVulnMetricsByDate(nodes)

  const lines = [
    {
      dataKey: 'statusAgePresent',
      name: 'Total number of days until resolution',
      stroke: theme.colors.red[500]
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Resolution Age
        </Text>
        <Text fontSize='sm'>
          Total number of days all vulnerabilities are present before resolution
        </Text>
      </Stack>
      <SingleGraph data={ageMetrics} lines={lines} averages={true} />
    </Card>
  )
}

export default VulnAge
