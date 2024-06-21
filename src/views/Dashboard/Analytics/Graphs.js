import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { Center, Grid, Skeleton, useColorModeValue } from '@chakra-ui/react'

import { GraphUi } from './GraphsUi'
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
        vulnerabilityCount
        date
      }
    }
  }
`

export const Graphs = ({ filters }) => {
  const { startDate, endDate } = filters?.duration || {}
  const bgColor = useColorModeValue('gray.200', 'gray.800')

  const { data, loading, error } = useQuery(DAILY_METRICS_QUERY, {
    variables: {
      sbomIds: filters?.version?.value ? [filters?.version?.value] : [],
      projectNames: filters?.env?.value ? [filters?.env?.value] : [],
      projectGroupIds: filters?.product?.value ? [filters?.product?.value] : [],
      startDate,
      endDate: endDate
    },
    skip: !filters.version || !startDate || !endDate
  })

  if (!filters.version || !filters.duration) {
    return (
      <Grid width={'100%'} templateColumns={`repeat(3,1fr)`} gap={6}>
        {['License Count', 'Components Count', 'Vulnerability Count'].map(
          (item, index) => (
            <Center width={'100%'} height={48} bg={bgColor} key={index}>
              {item}
            </Center>
          )
        )}
      </Grid>
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
