import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatDate } from 'views/Dashboard/Analytics/utils'

import { Stack, Text, theme } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLoader from 'components/Misc/LynkLoader'

import useFetchAllNodes from 'hooks/useFetchAllNodes'
import { useGlobalState } from 'hooks/useGlobalState'

const DefectDensityMetrics = gql`
  query DefectDensityMetrics(
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
        totalCount
        pageInfo {
          endCursor
          hasNextPage
          startCursor
          hasPreviousPage
        }
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
    query: DefectDensityMetrics,
    variables,
    selector: 'dailyMetrics.sbomMetrics',
    skip: !startDate || !endDate
  })

  const defectMetrics = data?.length
    ? Object.values(
        data.reduce((acc, item) => {
          const dateKey = item.date
          const { vulnerabilityAffectedCount, vulnerabilityFixedCount } = item
          const activeVulnerabilityCount =
            vulnerabilityFixedCount + vulnerabilityAffectedCount
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: dateKey ? formatDate(dateKey) : 'N/A',
              fixedVulnerabiltyRatio:
                activeVulnerabilityCount === 0
                  ? 0
                  : parseFloat(
                      (
                        (vulnerabilityFixedCount * 100) /
                        activeVulnerabilityCount
                      ).toFixed(2)
                    )
            }
          }

          return acc
        }, {})
      )
    : dates?.map((date) => ({
        date: date ? formatDate(date) : 'N/A',
        fixedVulnerabiltyRatio: 0
      })) || []

  const lines = [
    {
      dataKey: 'fixedVulnerabiltyRatio',
      name: 'Defect Density',
      stroke: theme.colors.blue[500]
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
