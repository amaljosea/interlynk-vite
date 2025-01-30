import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatForGraph } from 'views/Dashboard/Analytics/utils'

import { Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'

const LicenseMetrics = gql`
  query LicenseMetrics(
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
          licensesCount
        }
      }
    }
  }
`

const LicenseCount = ({ filters }) => {
  const { envName } = useGlobalState()
  const { version, product, duration, label } = filters || ''
  const { startDate, endDate } = duration || ''

  const { dates } = getDays({ startDate, endDate })

  const { data, loading } = useQuery(LicenseMetrics, {
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

  const { dataForGraph } = formatForGraph({
    nodes,
    dates
  })

  const lines = [
    {
      dataKey: 'licensesCount',
      name: 'License Count'
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          License Count
        </Text>
        <Text fontSize='sm'>
          Number of unique licenses included in versions over time
        </Text>
      </Stack>
      <SingleGraph lines={lines} data={dataForGraph} />
    </Card>
  )
}

export default LicenseCount
