/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getVulnsBySeverity } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const AllVulnerabilitiesBySeverity = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getVulnsBySeverity, {
    skip: !organization,
    variables: {
      labelIds: labelIdsVar,
      envName: envName
    }
  })

  const vulnSeverities = [
    {
      name: 'critical',
      value: data?.organization?.critical,
      color: '#E53E3E'
    },
    {
      name: 'high',
      value: data?.organization?.high,
      color: '#DD6B20'
    },
    {
      name: 'medium',
      value: data?.organization?.medium,
      color: '#D69E2E'
    },
    {
      name: 'low',
      value: data?.organization?.low,
      color: '#38A169'
    },
    {
      name: 'unknown',
      value: data?.organization?.unknown,
      color: '#718096'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      data={vulnSeverities}
      title='All Vulnerabilities by Severity'
      total={data?.organization?.total}
    />
  )
}

export default AllVulnerabilitiesBySeverity
