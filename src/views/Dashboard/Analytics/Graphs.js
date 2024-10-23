import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { Center, Icon, SimpleGrid } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { TfiBarChart } from 'react-icons/tfi'

import { GraphUi } from './GraphsUi'
import { formatForGraph, getDays } from './utils'

const DAILY_METRICS_QUERY = gql`
  query DailyMetrics(
    $projectNames: [String!]
    $projectGroupIds: [Uuid!]
    $sbomIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $level: OrganizationMetricLevelEnum
  ) {
    dailyMetrics {
      sbomMetrics(
        level: $level
        projectNames: $projectNames
        projectGroupIds: $projectGroupIds
        sbomIds: $sbomIds
        startDate: $startDate
        endDate: $endDate
      ) {
        nodes {
          componentsCount
          date
          licensesCount
          policiesCount
          policyResultDetectedCount
          policyResultErrorCount
          policyResultNotDetectedCount
          policyResultPassedCount
          policyRuleViolationFailCount
          policyRuleViolationInformCount
          policyRuleViolationPassCount
          policyRuleViolationWarnCount
          policyViolationsCount
          vulnerabilityAffectedCount
          vulnerabilityCount
          vulnerabilityCriticalCount
          vulnerabilityFixedCount
          vulnerabilityHighCount
          vulnerabilityInTriageCount
          vulnerabilityLowCount
          vulnerabilityMediumCount
          vulnerabilityNotAffectedCount
          vulnerabilityUnknownSevCount
          vulnerabilityUnspecifiedCount
          averageVulnerabilityDuration
          aggregator
          policyResultSkippedCount
        }
      }
    }
  }
`

export const Graphs = ({ filters }) => {
  const { orgView } = useGlobalQueryContext()
  const { startDate, endDate } = filters?.duration || {}
  const { headingTextSecondary } = useThemeColor(['headingTextSecondary'])

  const { data, loading, error } = useQuery(DAILY_METRICS_QUERY, {
    variables: {
      sbomIds: filters.version?.map((p) => p.value),
      projectNames: filters?.env?.value ? [filters?.env?.value] : [],
      projectGroupIds: filters.product?.map((p) => p.value),
      startDate,
      endDate: endDate
    },
    skip: !filters.version || !startDate || !endDate || !orgView
  })

  if (!filters.version.length || !filters.duration) {
    return (
      <SimpleGrid width={'100%'} columns={2} spacing={24}>
        {[1, 2, 3, 4].map((_, index) => (
          <Center key={index}>
            <Icon as={TfiBarChart} boxSize={44} color={headingTextSecondary} />
          </Center>
        ))}
      </SimpleGrid>
    )
  }

  const nodes = data?.dailyMetrics?.sbomMetrics?.nodes || []

  const { dates } = getDays({
    startDate,
    endDate
  })

  const { dataForGraph } = formatForGraph({
    nodes,
    dates
  })

  if (loading) {
    return <CustomLoader />
  }

  if (error) {
    return 'Error!'
  }

  return <GraphUi dataForGraph={dataForGraph} />
}
