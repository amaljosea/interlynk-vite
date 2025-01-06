import { gql, useQuery } from '@apollo/client'

import { Center, Icon, SimpleGrid } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  GetDailyMetrics,
  GetProjectMetrics,
  GetProjectVulnMetrics
} from 'graphQL/Queries'

import { TfiBarChart } from 'react-icons/tfi'

import { GraphUi } from './GraphsUi'
import { formatForGraph, getDays } from './utils'

export const Graphs = ({ filters }) => {
  const { orgView } = useGlobalQueryContext()
  const { startDate, endDate } = filters?.duration || {}
  const { headingTextSecondary } = useThemeColor(['headingTextSecondary'])

  const { data, loading, error } = useQuery(GetDailyMetrics, {
    variables: {
      sbomIds: filters.version?.map((p) => p.value),
      projectNames: filters?.env?.value ? [filters?.env?.value] : [],
      projectGroupIds: filters.product?.map((p) => p.value),
      startDate,
      endDate: endDate
    },
    skip: !filters.version || !startDate || !endDate || !orgView
  })

  const { data: metrics, loading: prodLoading } = useQuery(GetProjectMetrics, {
    skip: filters?.product?.length > 0 ? false : true,
    variables: {
      projectGroupIds: filters.product?.map((p) => p.value)
    }
  })
  const { nodes: prodMetrics } = metrics?.dailyMetrics?.projectMetrics || ''

  const { data: vulnMetrics, loading: vulnloading } = useQuery(
    GetProjectVulnMetrics,
    {
      skip: filters?.product?.length > 0 ? false : true,
      variables: {
        projectGroupIds: filters.product?.map((p) => p.value),
        startDate,
        endDate: endDate
      }
    }
  )
  const { nodes: prodVulnMetrics } =
    vulnMetrics?.dailyMetrics?.projectMetrics || ''

  if (!filters.product.length || !filters.duration) {
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

  if (loading || prodLoading) {
    return <CustomLoader />
  }

  if (error) {
    return 'Error!'
  }

  return (
    <GraphUi
      dataForGraph={dataForGraph}
      projectMetrics={prodMetrics}
      prodVulnMetrics={prodVulnMetrics}
    />
  )
}
