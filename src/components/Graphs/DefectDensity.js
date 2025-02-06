import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import { useGlobalState } from 'hooks/useGlobalState'

const DefectDensityMetrics = gql`
  query DefectDensityMetrics(
    $first: Int
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
          vulnerabilityCount
          vulnerabilityAffectedCount
          vulnerabilityNotAffectedCount
          vulnerabilityFixedCount
        }
      }
    }
  }
`

const DefectDensity = ({ filters }) => {
  const { envName } = useGlobalState()
  const { version, product, duration, label } = filters || ''
  const { startDate, endDate } = duration || ''

  const { dates } = getDays({ startDate, endDate })

  const { data, loading } = useQuery(DefectDensityMetrics, {
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

  const defectMetrics = nodes?.length
    ? Object.values(
        nodes.reduce((acc, item) => {
          const dateKey = item.date
          const {
            vulnerabilityCount,
            vulnerabilityNotAffectedCount,
            vulnerabilityAffectedCount,
            vulnerabilityFixedCount
          } = item
          const totalVulnerabilityCount =
            vulnerabilityCount + vulnerabilityNotAffectedCount
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey ? formatDate(dateKey) : 'N/A',
              updatedVulnerabilityRate:
                totalVulnerabilityCount === 0
                  ? 0
                  : parseFloat(
                      (
                        ((vulnerabilityNotAffectedCount +
                          vulnerabilityAffectedCount +
                          vulnerabilityFixedCount) *
                          100) /
                        totalVulnerabilityCount
                      ).toFixed(2)
                    )
            }
          }

          return acc
        }, {})
      )
    : dates?.map((date) => ({
        date: date ? formatDate(date) : 'N/A',
        updatedVulnerabilityRate: 0
      })) || []

  const lines = [
    {
      dataKey: 'updatedVulnerabilityRate',
      name: 'Defect Density'
    }
  ]

  if (loading) return <LynkLoader />

  return (
    <Card>
      <Stack h='90px' spacing={1} mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Defect Density
        </Text>
        <Text fontSize='sm'>
          Percentage of identified vulnerabilities that are updated or patched
        </Text>
      </Stack>
      <SingleGraph lines={lines} percentage={true} data={defectMetrics} />
    </Card>
  )
}

export default DefectDensity
