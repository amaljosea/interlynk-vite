import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { Center, Flex, useColorModeValue } from '@chakra-ui/react'

import { GraphUi } from './GraphsUi'
import Placeholder from './Placeholder.png'
import { formatForGraph, getDays } from './utils'

const DAILY_METRICS_QUERY = gql`
  query DailyMetrics(
    $projectNames: [String!]
    $projectGroupIds: [Uuid!]
    $sbomIds: [Uuid!]
    $startDate: ISO8601Date
    $endDate: ISO8601Date
  ) {
    dailyMetrics(
      startDate: $startDate
      endDate: $endDate
      sbomIds: $sbomIds
      projectNames: $projectNames
      projectGroupIds: $projectGroupIds
    ) {
      nodes {
        licensesCount
        componentsCount
        vulnerabilityCriticalCount
        vulnerabilityHighCount
        vulnerabilityMediumCount
        vulnerabilityLowCount
        vulnerabilityUnknownSevCount
        vulnerabilityCount
        averageVulnerabilityDuration
        date
      }
    }
  }
`

export const Graphs = ({ filters }) => {
  const { startDate, endDate } = filters?.duration || {}

  const { data, loading, error } = useQuery(DAILY_METRICS_QUERY, {
    variables: {
      sbomIds: filters.version?.map((p) => p.value),
      projectNames: filters?.env?.value ? [filters?.env?.value] : [],
      projectGroupIds: filters.product?.map((p) => p.value),
      startDate,
      endDate: endDate
    },
    skip: !filters.version || !startDate || !endDate
  })

  if (!filters.version.length || !filters.duration) {
    return (
      <Flex
        mt={4}
        gap={8}
        width={'100%'}
        flexWrap={'wrap'}
        alignItems={'center'}
        justifyContent='center'
      >
        {['License Count', 'Components Count', 'Vulnerability Count'].map(
          (item, index) => (
            <Center
              width={500}
              height={300}
              backgroundRepeat='no-repeat'
              backgroundImage={Placeholder}
              backgroundPosition='center'
              key={index}
            />
          )
        )}
      </Flex>
    )
  }

  const nodes = data?.dailyMetrics?.nodes || []

  const { dates } = getDays({
    startDate,
    endDate
  })

  const { dataForGraph } = formatForGraph({
    nodes,
    dates
  })

  if (loading) {
    return 'Loading...'
  }

  if (error) {
    return 'Error!'
  }

  return <GraphUi dataForGraph={dataForGraph} />
}
