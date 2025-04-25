/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getHighVulnsByStatus } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const HighVulnerabilitiesByStatus = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getHighVulnsByStatus, {
    skip: !organization,
    variables: {
      severity: ['high'],
      labelIds: labelIdsVar,
      envNames: [envName]
    }
  })

  const vulnHighStatuses = [
    {
      name: 'Unspecified',
      value: data?.organization?.highUnspecified?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: data?.organization?.highInTriage?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: data?.organization?.highAffected?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: data?.organization?.highFixed?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: data?.organization?.highNotAffected?.totalCount,
      color: '#38A169'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      data={vulnHighStatuses}
      title='High Vulnerabilities by Status'
      total={data?.organization?.total?.totalCount}
    />
  )
}

export default HighVulnerabilitiesByStatus
