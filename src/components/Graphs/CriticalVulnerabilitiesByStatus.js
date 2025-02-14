/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getCriticalVulnsByStatus } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const CriticalVulnerabilitiesByStatus = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getCriticalVulnsByStatus, {
    skip: !organization,
    variables: {
      severity: ['critical'],
      labelIds: labelIdsVar,
      envNames: [envName]
    }
  })

  const vulnCriticalStatuses = [
    {
      name: 'Unspecified',
      value: data?.organization?.criticalUnspecified?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: data?.organization?.criticalInTriage?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: data?.organization?.criticalAffected?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: data?.organization?.criticalFixed?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: data?.organization?.criticalNotAffected?.totalCount,
      color: '#38A169'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      title='Critical Vulnerabilities by Status'
      data={vulnCriticalStatuses}
    />
  )
}

export default CriticalVulnerabilitiesByStatus
