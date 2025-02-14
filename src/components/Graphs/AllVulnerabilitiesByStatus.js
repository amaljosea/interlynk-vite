/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { useGlobalState } from 'hooks/useGlobalState'

import { getVulnsByStatus } from 'graphQL/Queries'

import LynkPieChart from '../Charts/LynkPieChart'

const AllVulnerabilitiesByStatus = () => {
  const { organization, envName, labelIds } = useGlobalState()

  const labelIdsVar = labelIds?.length > 0 ? labelIds : undefined

  const { data, loading } = useQuery(getVulnsByStatus, {
    skip: !organization,
    variables: {
      labelIds: labelIdsVar,
      envNames: envName ? [envName] : undefined
    }
  })

  const vulnStatues = [
    {
      name: 'Unspecified',
      value: data?.organization?.unspecified?.totalCount,
      color: '#718096'
    },
    {
      name: 'In Triage',
      value: data?.organization?.inTriage?.totalCount,
      color: '#003558'
    },
    {
      name: 'Affected',
      value: data?.organization?.affected?.totalCount,
      color: '#E53E3E'
    },
    {
      name: 'Fixed',
      value: data?.organization?.fixed?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Not Affected',
      value: data?.organization?.notAffected?.totalCount,
      color: '#38A169'
    }
  ]
  return (
    <LynkPieChart
      loading={loading}
      title='All Vulnerabilities by Status'
      data={vulnStatues}
    />
  )
}

export default AllVulnerabilitiesByStatus
