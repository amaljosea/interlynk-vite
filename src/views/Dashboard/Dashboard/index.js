/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Flex,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Skeleton
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkLineChart from 'components/Charts/LynkLineChart'
import LynkPieChart from 'components/Charts/LynkPieChart'
import CustomLoader from 'components/CustomLoader'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'

import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import {
  GetOrgMetrics,
  getAllPolicies,
  getVulnsBySeverity,
  getVulnsByStatus,
  getVulnsWithConditions
} from 'graphQL/Queries'
import { GetDailyMetrics } from 'graphQL/Queries'

import ActivitiesOverview from './components/ActivitiesOverview'
import ProductLabels from './components/ProductLabels'
import ProductLifestages from './components/ProductLifestages'
import ProductsOverview from './components/ProductsOverview'

const severities = {
  critical: '#E53E3E',
  high: '#DD6B20',
  medium: '#D69E2E',
  low: '#38A169',
  unknown: '#718096'
}

const statues = {
  inTriage: '#00B5D8',
  affected: '#E53E3E',
  notAffected: '#38A169',
  fixed: '#3182CE',
  unspecified: '#718096'
}

export default function Dashboard() {
  const { setIsOpen } = useTour()
  const product = useQueryParam('id')
  const { dispatch, envName, organization } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const { data: metrics, loading } = useQuery(GetOrgMetrics, {
    skip: organization ? false : true,
    variables: { env: envName }
  })

  // --------------- DAILY MATRICS --------------------
  const { data, loading: metricsLoading } = useQuery(GetDailyMetrics, {
    skip: organization ? false : true,
    variables: {
      first: 500,
      projectNames: [envName]
    }
  })

  const { sbomMetrics } = data?.dailyMetrics || ''

  const filterMetrics = useMemo(
    () =>
      sbomMetrics?.nodes?.length > 0
        ? Object.values(
            sbomMetrics?.nodes?.reduce((acc, item) => {
              if (!acc[item?.date]) {
                acc[item?.date] = {
                  date: item?.date,
                  vulnerabilityCount: 0,
                  vulnerabilityCriticalCount: 0,
                  vulnerabilityHighCount: 0,
                  vulnerabilityMediumCount: 0,
                  vulnerabilityLowCount: 0,
                  vulnerabilityUnknownSevCount: 0
                }
              }

              acc[item?.date].vulnerabilityCount = item?.vulnerabilityCount || 0
              acc[item?.date].vulnerabilityCriticalCount +=
                item?.vulnerabilityCriticalCount || 0
              acc[item?.date].vulnerabilityHighCount +=
                item?.vulnerabilityHighCount || 0
              acc[item?.date].vulnerabilityMediumCount +=
                item?.vulnerabilityMediumCount || 0
              acc[item?.date].vulnerabilityLowCount +=
                item?.vulnerabilityLowCount || 0
              acc[item?.date].vulnerabilityUnknownSevCount +=
                item?.vulnerabilityUnknownSevCount || 0
              return acc
            }, {})
          )
        : [],
    [sbomMetrics?.nodes]
  )

  const vulnSeverityGraphs = useCallback(
    (day = 7) => {
      if (filterMetrics?.length > 0) {
        const data = filterMetrics?.slice(0, day)
        return data?.map((item) => ({
          date: new Date(item?.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          critical: item?.vulnerabilityCriticalCount || 0,
          high: item?.vulnerabilityHighCount || 0,
          medium: item?.vulnerabilityMediumCount || 0,
          low: item?.vulnerabilityLowCount || 0,
          unknown: item?.vulnerabilityUnknownSevCount || 0
        }))
      } else {
        return []
      }
    },
    [filterMetrics]
  )

  const filterStatuses = useMemo(
    () =>
      sbomMetrics?.nodes?.length > 0
        ? Object.values(
            sbomMetrics?.nodes?.reduce((acc, item) => {
              if (!acc[item?.date]) {
                acc[item?.date] = {
                  date: item?.date,
                  vulnerabilityInTriageCount: 0,
                  vulnerabilityAffectedCount: 0,
                  vulnerabilityNotAffectedCount: 0,
                  vulnerabilityFixedCount: 0,
                  vulnerabilityUnspecifiedCount: 0
                }
              }

              acc[item?.date].vulnerabilityInTriageCount =
                item?.vulnerabilityInTriageCount || 0
              acc[item?.date].vulnerabilityAffectedCount +=
                item?.vulnerabilityAffectedCount || 0
              acc[item?.date].vulnerabilityNotAffectedCount +=
                item?.vulnerabilityNotAffectedCount || 0
              acc[item?.date].vulnerabilityFixedCount +=
                item?.vulnerabilityFixedCount || 0
              acc[item?.date].vulnerabilityUnspecifiedCount +=
                item?.vulnerabilityUnspecifiedCount || 0
              return acc
            }, {})
          )
        : [],
    [sbomMetrics?.nodes]
  )

  const vulnStatusGraphs = useCallback(
    (day = 7) => {
      if (filterStatuses?.length > 0) {
        const data = filterStatuses?.slice(0, day)
        return data?.map((item) => ({
          date: new Date(item?.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          inTriage: item?.vulnerabilityInTriageCount,
          affected: item?.vulnerabilityAffectedCount,
          notAffected: item?.vulnerabilityNotAffectedCount,
          fixed: item?.vulnerabilityFixedCount,
          unspecified: item?.vulnerabilityUnspecifiedCount
        }))
      } else {
        return []
      }
    },
    [filterStatuses]
  )

  // -------------- POLICY RESULTS ---------------------
  const { data: informPolicies, loading: policyLoading } = useQuery(
    getAllPolicies,
    {
      skip: organization ? false : true,
      variables: {
        resultType: ['inform']
      }
    }
  )
  const { data: warnPolicies } = useQuery(getAllPolicies, {
    skip: organization ? false : true,
    variables: {
      resultType: ['warn']
    }
  })
  const { data: failPolicies } = useQuery(getAllPolicies, {
    skip: organization ? false : true,
    variables: {
      resultType: ['fail']
    }
  })

  // -------------- POLICY VIOLATIONS ---------------------
  const policyResults = [
    {
      name: 'Inform',
      value: informPolicies?.policies?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Warn',
      value: warnPolicies?.policies?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'Fail',
      value: failPolicies?.policies?.totalCount,
      color: '#E53E3E'
    }
  ]

  // -------------- VULN SEVERITIES ---------------------
  const { data: criticalVulns, loading: sevLoading } = useQuery(
    getVulnsBySeverity,
    {
      skip: organization ? false : true,
      variables: {
        severity: ['critical'],
        status: [
          'Unspecified',
          'In Triage',
          'Affected',
          'Not Affected',
          'Fixed'
        ],
        envNames: [envName]
      }
    }
  )

  const { data: highVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['high'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: mediumVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['medium'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: lowVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['low'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: unknownVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['unknown'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: criticalUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Unspecified'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['In Triage'],
      severity: ['critical'],
      envNames: [envName]
    }
  })
  const { data: criticalAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Affected'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Not Affected'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Fixed'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: kevUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Unspecified'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['In Triage'],
      kev: true
    }
  })
  const { data: kevAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Affected'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Not Affected'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Fixed'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: highUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Unspecified'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['In Triage'],
      severity: ['high'],
      envNames: [envName]
    }
  })
  const { data: highAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Affected'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Not Affected'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      status: ['Fixed'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const vulnSeverities = [
    {
      name: 'Critical',
      value: criticalVulns?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'High',
      value: highVulns?.organization?.vulns?.totalCount,
      color: '#DD6B20'
    },
    {
      name: 'Medium',
      value: mediumVulns?.organization?.vulns?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'Low',
      value: lowVulns?.organization?.vulns?.totalCount,
      color: '#38A169'
    },
    {
      name: 'Unknown',
      value: unknownVulns?.organization?.vulns?.totalCount,
      color: '#718096'
    }
  ]

  // -------------- VULN STATUS ---------------------
  const { data: unspecified, loading: statusLoading } = useQuery(
    getVulnsByStatus,
    {
      skip: organization ? false : true,
      variables: {
        status: ['Unspecified'],
        envNames: [envName]
      }
    }
  )

  const { data: inTriage } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      status: ['In Triage'],
      envNames: [envName]
    }
  })
  const { data: affected } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      status: ['Affected'],
      envNames: [envName]
    }
  })
  const { data: fixed } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      status: ['Fixed'],
      envNames: [envName]
    }
  })
  const { data: notAffected } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      status: ['Not Affected'],
      envNames: [envName]
    }
  })

  const vulnCriticalStatuses = [
    {
      name: 'Unspecified',
      value: criticalUnspecified?.organization?.vulns?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: criticalInTriage?.organization?.vulns?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: criticalAffected?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: criticalFixed?.organization?.vulns?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: criticalNotAffected?.organization?.vulns?.totalCount,
      color: '#38A169'
    }
  ]

  const vulnHighStatuses = [
    {
      name: 'Unspecified',
      value: highUnspecified?.organization?.vulns?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: highInTriage?.organization?.vulns?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: highAffected?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: highFixed?.organization?.vulns?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: highNotAffected?.organization?.vulns?.totalCount,
      color: '#38A169'
    }
  ]
  const vulnKEVStatuses = [
    {
      name: 'Unspecified',
      value: kevUnspecified?.organization?.vulns?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: kevInTriage?.organization?.vulns?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: kevAffected?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: kevFixed?.organization?.vulns?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: kevNotAffected?.organization?.vulns?.totalCount,
      color: '#38A169'
    }
  ]

  const vulnStatues = [
    {
      name: 'Unspecified',
      value: unspecified?.organization?.vulns?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: inTriage?.organization?.vulns?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: affected?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: fixed?.organization?.vulns?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: notAffected?.organization?.vulns?.totalCount,
      color: '#38A169'
    }
  ]

  const [severityTimeline, setSeverityTimeline] = useState(7)
  const [severityData, setSeverityData] = useState([])

  useEffect(() => {
    if (filterMetrics?.length > 0) {
      const output = vulnSeverityGraphs(severityTimeline)
      setSeverityData(output)
    }
  }, [filterMetrics?.length, severityTimeline, vulnSeverityGraphs])

  const [statusTimeline, setStatusTimeline] = useState(7)
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    if (filterMetrics?.length > 0) {
      const output = vulnStatusGraphs(severityTimeline)
      setStatusData(output)
    }
  }, [filterMetrics?.length, severityTimeline, vulnStatusGraphs])

  const onFilterSeverity = (days) => {
    setSeverityTimeline(days || 7)
  }

  const onFilterStatus = (days) => {
    setStatusTimeline(days || 7)
  }

  useEffect(() => {
    if (product === null) {
      setIsOpen(false)
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product, setIsOpen])

  if (!organization) {
    return (
      <Flex width={'100%'} flexDirection='column' gap={6}>
        <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index}>
              <Flex width={'100%'} gap={3} direction={'column'} mt={1}>
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
        <Grid
          templateColumns={{ sm: '1fr', md: '1fr 1fr', lg: '2fr 1fr' }}
          templateRows={{ sm: '1fr auto', md: '1fr', lg: '1fr' }}
          gap='24px'
        >
          {[1, 2].map((_, index) => (
            <Card key={index}>
              <CustomLoader />
            </Card>
          ))}
        </Grid>
      </Flex>
    )
  }

  return (
    <Flex width={'100%'} flexDirection='column' gap={5}>
      {/* ENVIRONMENT FILTER */}
      {organization && <GlobalEnvFilter />}
      {/* PRODUCT STATS */}
      <Heading size={'lg'} mt={'30px'}>
        Products
      </Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <ProductLifestages />
        <ProductLabels />
      </SimpleGrid>
      {/* VULN PIE CHARTS */}
      <Heading size={'lg'} mt={'30px'}>
        Vulnerabilities
      </Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <LynkPieChart
          loading={sevLoading}
          title='All Vulnerabilities by Severity'
          data={vulnSeverities}
        />
        <LynkPieChart
          loading={statusLoading}
          title='All Vulnerabilities by Status'
          data={vulnStatues}
        />
        <LynkPieChart
          loading={sevLoading}
          title='Critical Vulnerabilities by Status'
          data={vulnCriticalStatuses}
        />
        <LynkPieChart
          loading={sevLoading}
          title='High Vulnerabilities by Status'
          data={vulnHighStatuses}
        />
        <LynkPieChart
          loading={sevLoading}
          title='KEV Vulnerabilties by Status'
          data={vulnKEVStatuses}
        />
      </SimpleGrid>
      {/* VULN LINE CHARTS */}
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={5}>
        <LynkLineChart
          data={severityData}
          days={severityTimeline}
          options={severities}
          loading={metricsLoading}
          onChange={onFilterSeverity}
          title='Vulnerabilities by Severity'
        />
        <LynkLineChart
          data={statusData}
          options={statues}
          days={statusTimeline}
          loading={metricsLoading}
          onChange={onFilterStatus}
          title='Vulnerabilities by Status'
        />
      </SimpleGrid>

      <Heading size={'lg'} mt={'30px'}>
        Policies
      </Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <LynkPieChart
          loading={policyLoading}
          title='Policy Results'
          data={policyResults}
        />
      </SimpleGrid>
      {/* LIST */}
      <Heading size={'lg'} mt={'30px'}>
        Acitivities
      </Heading>
      <Grid templateColumns='repeat(12, 1fr)' gap={5} flexWrap={'wrap'}>
        {/* RECENT IMPORTS */}
        <GridItem colSpan={8} w='100%'>
          <ProductsOverview
            loading={loading}
            title={'Recent Imports'}
            data={metrics?.organizationMetric?.latestVersions}
          />
        </GridItem>
        {/* LATEST ACTIVITIES */}
        <GridItem colSpan={4} w='100%'>
          <ActivitiesOverview
            loading={loading}
            title={'Recent Activities'}
            amount={metrics?.organizationMetric?.latestActivity?.length}
            data={metrics?.organizationMetric?.latestActivity}
          />
        </GridItem>
      </Grid>
    </Flex>
  )
}
