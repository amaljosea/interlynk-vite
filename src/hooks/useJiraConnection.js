import { useQuery } from '@apollo/client'

import { GetJiraConnections } from 'graphQL/Queries'

export const useJiraConnection = () => {
  const { data, loading, error } = useQuery(GetJiraConnections)

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
