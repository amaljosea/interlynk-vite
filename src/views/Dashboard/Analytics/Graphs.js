import { useQuery } from '@apollo/client'

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

  const { dates } = getDays({
    startDate,
    endDate
  })

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

  const processVulnMetricsByDate = (data) => {
    if (!data || !Array.isArray(data.nodes)) {
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

    data.nodes.forEach((node) => {
      const {
        date,
        statusAgeAffected = 0,
        statusAgeFixed = 0,
        statusAgeNotAffected = 0,
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
      date: entry.date,
      statusAgePresent: entry.statusAgePresent,
      statusAgeResolved: entry.statusAgeResolved,
      statusCount: entry.statusCount,
      statusAgePresentAverage:
        entry.statusCount === 0
          ? 0
          : entry.statusAgePresent / entry.statusCount,
      statusAgeResolvedAverage:
        entry.statusCount === 0
          ? 0
          : entry.statusAgeResolved / entry.statusCount
    }))
  }
  const prodVulnMetricProcessed = processVulnMetricsByDate(
    vulnMetrics?.dailyMetrics?.projectVulnMetrics
  )

  if (!filters.product.length || !filters.version.length || !filters.duration) {
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

  const { dataForGraph } = formatForGraph({
    nodes,
    dates
  })

  if (loading || prodLoading || vulnloading) {
    return <CustomLoader />
  }

  if (error) {
    return 'Error!'
  }

  return (
    <GraphUi
      dataForGraph={dataForGraph}
      projectMetrics={prodMetrics}
      prodVulnMetrics={prodVulnMetricProcessed}
    />
  )
}
