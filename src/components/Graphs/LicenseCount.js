import { gql, useQuery } from '@apollo/client'
import { SingleGraph } from 'views/Dashboard/Analytics/SingleGraph'
import { getDays } from 'views/Dashboard/Analytics/utils'
import { formatForGraph } from 'views/Dashboard/Analytics/utils'

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

const LicenseCount = () => {
  const { envName, analyticsState } = useGlobalState()
  const { version, product, duration, label } = analyticsState || {}
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

  return <SingleGraph lines={lines} data={dataForGraph} />
}

export default LicenseCount
