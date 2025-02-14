/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getKevVulnsByStatus } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const KevVulnerabilitiesByStatus = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getKevVulnsByStatus, {
    skip: !organization,
    variables: {
      kev: true,
      labelIds: labelIdsVar,
      envNames: [envName]
    }
  })

  const vulnKEVStatuses = [
    {
      name: 'Unspecified',
      value: data?.organization?.kevUnspecified?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: data?.organization?.kevInTriage?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: data?.organization?.kevAffected?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: data?.organization?.kevFixed?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: data?.organization?.kevNotAffected?.totalCount,
      color: '#38A169'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      title='KEV Vulnerabilties by Status'
      data={vulnKEVStatuses}
    />
  )
}

export default KevVulnerabilitiesByStatus
