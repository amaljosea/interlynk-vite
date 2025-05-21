/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getVulnsByStatus } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const CriticalVulnerabilitiesByStatus = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getVulnsByStatus, {
    skip: !organization,
    variables: {
      severity: ['critical'],
      labelIds: labelIdsVar,
      envName: envName
    }
  })

  const vulnCriticalStatuses = [
    {
      name: 'Unspecified',
      value: data?.organization?.unspecified,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: data?.organization?.inTriage,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: data?.organization?.affected,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: data?.organization?.fixed,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: data?.organization?.notAffected,
      color: '#38A169'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      data={vulnCriticalStatuses}
      title='Critical Vulnerabilities by Status'
      total={data?.organization?.total}
    />
  )
}

export default CriticalVulnerabilitiesByStatus
