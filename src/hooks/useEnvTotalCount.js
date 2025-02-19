import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { GetGlobalVulnsTotalCount } from 'graphQL/Queries'

export const useEnvTotalCounts = ({ filters, queryOptions }) => {
  const { data, loading } = useQuery(GetGlobalVulnsTotalCount, {
    ...queryOptions,
    variables: filters
  })

  const {
    default: defaultEnv,
    development,
    production
  } = data?.organization || {}

  return useMemo(
    () => ({
      defaultTotalCount: defaultEnv?.totalCount || 0,
      developmentTotalCount: development?.totalCount || 0,
      productionTotalCount: production?.totalCount || 0,
      totalsLoading: loading
    }),
    [defaultEnv, development, production, loading]
  )
}
