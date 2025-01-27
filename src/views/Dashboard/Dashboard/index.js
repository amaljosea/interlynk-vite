/* eslint-disable no-restricted-syntax */
import { useLazyQuery, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { format, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { formatToISO } from 'utils'

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
  getPolicyViolations,
  getVulnsBySeverity,
  getVulnsByStatus,
  getVulnsWithConditions
} from 'graphQL/Queries'

import ActivitiesOverview from './components/ActivitiesOverview'
import ProductLabels from './components/ProductLabels'
import ProductLifestages from './components/ProductLifestages'
import ProductsOverview from './components/ProductsOverview'

const vulnSeverityGraphs = (days = 7) => {
  return Array.from({ length: days }, (_, index) => {
    const date = format(subDays(new Date(), days - index - 1), 'MMM d')
    const firstMatchDateAfter = formatToISO(date)
    return {
      date,
      critical: Math.floor(Math.random() * 20),
      high: Math.floor(Math.random() * 10),
      medium: Math.floor(Math.random() * 20),
      low: Math.floor(Math.random() * 25),
      unknown: Math.floor(Math.random() * 10)
    }
  })
}

const vulnStatusGraphs = (days = 7) => {
  return Array.from({ length: days }, (_, index) => {
    const date = format(subDays(new Date(), days - index - 1), 'MMM d')

    return {
      date,
      inTriage: Math.floor(Math.random() * 20),
      affected: Math.floor(Math.random() * 10),
      fixed: Math.floor(Math.random() * 25),
      notAffected: Math.floor(Math.random() * 15)
    }
  })
}

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
  fixed: '#3182CE'
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

  // -------------- POLICY VIOLATIONS ---------------------
  const { data: informViolations, loading: violationLoading } = useQuery(
    getPolicyViolations,
    {
      skip: organization ? false : true,
      variables: {
        resultType: ['inform']
      }
    }
  )
  const { data: warnViolations } = useQuery(getPolicyViolations, {
    skip: organization ? false : true,
    variables: {
      resultType: ['warn']
    }
  })
  const { data: failViolations } = useQuery(getPolicyViolations, {
    skip: organization ? false : true,
    variables: {
      resultType: ['fail']
    }
  })

  // -------------- VULN SEVERITIES ---------------------
  const { data: uniqueCriticalVulns, loading: sevLoading } = useQuery(
    getVulnsBySeverity,
    {
      skip: organization ? false : true,
      variables: {
        severity: ['critical'],
        envNames: [envName]
      }
    }
  )

  const { data: uniqueHighVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: uniqueMediumVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['medium'],
      envNames: [envName]
    }
  })

  const { data: uniqueLowVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['low'],
      envNames: [envName]
    }
  })

  const { data: uniqueUnknownVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['unknown'],
      envNames: [envName]
    }
  })

  const { data: criticalVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      severity: ['critical'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

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

  const uniqueVulnSeverities = [
    {
      name: 'Critical',
      value: uniqueCriticalVulns?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'High',
      value: uniqueHighVulns?.organization?.vulns?.totalCount,
      color: '#DD6B20'
    },
    {
      name: 'Medium',
      value: uniqueMediumVulns?.organization?.vulns?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'Low',
      value: uniqueLowVulns?.organization?.vulns?.totalCount,
      color: '#38A169'
    },
    {
      name: 'Unknown',
      value: uniqueUnknownVulns?.organization?.vulns?.totalCount,
      color: '#718096'
    }
  ]

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
  const [severityData, setSeverityData] = useState(() =>
    vulnSeverityGraphs(severityTimeline)
  )

  const [statusTimeline, setStatusTimeline] = useState(7)
  const [statusData, setStatusData] = useState(() =>
    vulnStatusGraphs(statusTimeline)
  )

  const onFilterSeverity = (days) => {
    setSeverityTimeline(days || 7)
    setSeverityData(vulnSeverityGraphs(days || 7))
  }

  const onFilterStatus = (days) => {
    setStatusTimeline(days || 7)
    setStatusData(vulnStatusGraphs(days || 7))
  }

  const [getSeverities] = useLazyQuery(getVulnsBySeverity)

  useEffect(() => {
    if (severityData?.length > 0) {
      severityData?.map((item) => {
        const date = formatToISO(item?.date)
        let result = { date: item?.date }
        getSeverities({
          variables: { severity: ['critical'], firstMatchDateAfter: date }
        }).then((res) => {
          const { vulns } = res?.data?.organization || ''
          const output = { ...result, critcal: vulns?.totalCount }
          result = output
        })
        getSeverities({
          variables: { severity: ['high'], firstMatchDateAfter: date }
        }).then((res) => {
          const { vulns } = res?.data?.organization || ''
          const output = { ...result, high: vulns?.totalCount }
          result = output
        })
        getSeverities({
          variables: { severity: ['low'], firstMatchDateAfter: date }
        }).then((res) => {
          const { vulns } = res?.data?.organization || ''
          const output = { ...result, low: vulns?.totalCount }
          result = output
        })
        getSeverities({
          variables: { severity: ['medium'], firstMatchDateAfter: date }
        }).then((res) => {
          const { vulns } = res?.data?.organization || ''
          const output = { ...result, medium: vulns?.totalCount }
          result = output
        })
        getSeverities({
          variables: { severity: ['unknown'], firstMatchDateAfter: date }
        }).then((res) => {
          const { vulns } = res?.data?.organization || ''
          const output = { ...result, unknown: vulns?.totalCount }
          result = output
        })
      })
    }
  }, [getSeverities, severityData, severityData?.length])

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
          onChange={onFilterSeverity}
          title='Vulnerabilities by Severity'
        />
        <LynkLineChart
          data={statusData}
          options={statues}
          days={statusTimeline}
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
