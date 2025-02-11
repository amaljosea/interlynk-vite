/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import LynkPieChart from 'components/Charts/LynkPieChart'
import DefectDensity from 'components/Graphs/DefectDensity'
import DeployVelocity from 'components/Graphs/DeployVelocity'
import IdentityVelocity from 'components/Graphs/IdentificationVelocity'
import PatchVelocity from 'components/Graphs/PatchVelocity'
import VulnAge from 'components/Graphs/VulnAge'
import VulnBySeverity from 'components/Graphs/VulnBySeverity'
import VulnByStatus from 'components/Graphs/VulnByStatus'

import useDateRange from 'hooks/useDateRange'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

import {
  getVulnsBySeverity,
  getVulnsByStatus,
  getVulnsWithConditions
} from 'graphQL/Queries'
import { vulnStatusTypes } from 'variables/general'

const VulnGraphs = ({ labelIds }) => {
  const { organization, envName } = useGlobalState()

  const { startDate, endDate } = useDateRange()

  const { isFreeTier } = useGlobalQueryContext()

  const filters = {
    label: labelIds,
    duration: { startDate: startDate, endDate: endDate }
  }

  // -------------- VULN SEVERITIES ---------------------
  const { data: criticalVulns, loading: sevLoading } = useQuery(
    getVulnsBySeverity,
    {
      skip: organization ? false : true,
      variables: {
        severity: ['critical'],
        status: vulnStatusTypes,
        labelIds: labelIds?.length > 0 ? labelIds : undefined,
        envNames: [envName]
      }
    }
  )

  const { data: highVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      severity: ['high'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: mediumVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      severity: ['medium'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: lowVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      severity: ['low'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: unknownVulns } = useQuery(getVulnsBySeverity, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      severity: ['unknown'],
      status: ['Unspecified', 'In Triage', 'Affected', 'Not Affected', 'Fixed'],
      envNames: [envName]
    }
  })

  const { data: criticalUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Unspecified'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['In Triage'],
      severity: ['critical'],
      envNames: [envName]
    }
  })
  const { data: criticalAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Affected'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Not Affected'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: criticalFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Fixed'],
      severity: ['critical'],
      envNames: [envName]
    }
  })

  const { data: kevUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Unspecified'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['In Triage'],
      kev: true
    }
  })
  const { data: kevAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Affected'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Not Affected'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: kevFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Fixed'],
      kev: true,
      envNames: [envName]
    }
  })

  const { data: highUnspecified } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Unspecified'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highInTriage } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['In Triage'],
      severity: ['high'],
      envNames: [envName]
    }
  })
  const { data: highAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Affected'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highNotAffected } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Not Affected'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const { data: highFixed } = useQuery(getVulnsWithConditions, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Fixed'],
      severity: ['high'],
      envNames: [envName]
    }
  })

  const vulnSeverities = [
    {
      name: 'critical',
      value: criticalVulns?.organization?.vulns?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'high',
      value: highVulns?.organization?.vulns?.totalCount,
      color: '#DD6B20'
    },
    {
      name: 'medium',
      value: mediumVulns?.organization?.vulns?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'low',
      value: lowVulns?.organization?.vulns?.totalCount,
      color: '#38A169'
    },
    {
      name: 'unknown',
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
        labelIds: labelIds?.length > 0 ? labelIds : undefined,
        status: ['Unspecified'],
        envNames: [envName]
      }
    }
  )

  const { data: inTriage } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['In Triage'],
      envNames: [envName]
    }
  })
  const { data: affected } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Affected'],
      envNames: [envName]
    }
  })
  const { data: fixed } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
      status: ['Fixed'],
      envNames: [envName]
    }
  })
  const { data: notAffected } = useQuery(getVulnsByStatus, {
    skip: organization ? false : true,
    variables: {
      labelIds: labelIds?.length > 0 ? labelIds : undefined,
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

  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Vulnerabilities</Heading>
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
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <VulnBySeverity filters={filters} />
        <VulnByStatus filters={filters} />
        {!isFreeTier && (
          <>
            <PatchVelocity filters={filters} />
            <DefectDensity filters={filters} />
            <DeployVelocity filters={filters} />
            <VulnAge filters={filters} />
            <IdentityVelocity filters={filters} />
          </>
        )}
      </SimpleGrid>
    </Stack>
  )
}

export default VulnGraphs
