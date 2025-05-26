import { useQuery } from '@apollo/client'

import { GetJiraConnections } from 'graphQL/Queries'

import { useRouteFlags } from './useRouteFlags'

export const useJiraConnection = () => {
  const { isCustomerView } = useRouteFlags()
  const { data, loading, error } = useQuery(GetJiraConnections, {
    skip: isCustomerView
  })

  const nodes = data?.organization?.connections?.nodes || []

  const jiraConnectionExists = nodes?.some(
    (item) =>
      item?.connection?.__typename === 'JiraConnection' &&
      item?.enabled === true
  )

  return {
    connection: jiraConnectionExists,
    loading,
    error
  }
}
