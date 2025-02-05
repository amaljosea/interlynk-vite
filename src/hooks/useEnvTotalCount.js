//Get total counts of all vulnerabilities in an environment with or without additional filters
import { gql } from '@apollo/client'
import { useMemo } from 'react'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

const GetGlobalVulns = gql`
  query GetGlobalVulns(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $search: String
    $severity: [String!]
    $projectNames: [String!]
    $projectIds: [Uuid!]
    $projectGroupIds: [Uuid!]
    $status: [String!]
    $kev: Boolean
    $epss: RangeInput
    $field: VulnOrderByFields!
    $direction: OrderByDirection!
    $projectGroupLabelIds: [Uuid!]
  ) {
    organization {
      vulns(
        after: $after
        first: $first
        before: $before
        last: $last
        search: $search
        projectNames: $projectNames
        projectGroupIds: $projectGroupIds
        status: $status
        severity: $severity
        kev: $kev
        epss: $epss
        projectGroupLabelIds: $projectGroupLabelIds
        orderBy: { field: $field, direction: $direction }
        projectIds: $projectIds
      ) {
        totalCount
      }
    }
  }
`

export const useEnvTotalCounts = ({ filters, queryOptions }) => {
  // Query for "default" project
  const { paginationProps: defaultPagination } = usePaginatedQuery(
    GetGlobalVulns,
    {
      ...queryOptions,
      variables: { ...filters, projectNames: ['default'] }
    }
  )

  // Query for "development" project
  const { paginationProps: developmentPagination } = usePaginatedQuery(
    GetGlobalVulns,
    {
      ...queryOptions,
      variables: { ...filters, projectNames: ['development'] }
    }
  )

  // Query for "production" project
  const { paginationProps: productionPagination } = usePaginatedQuery(
    GetGlobalVulns,
    {
      ...queryOptions,
      variables: { ...filters, projectNames: ['production'] }
    }
  )

  return useMemo(
    () => ({
      defaultTotalCount: defaultPagination?.totalCount || 0,
      developmentTotalCount: developmentPagination?.totalCount || 0,
      productionTotalCount: productionPagination?.totalCount || 0,
      totalsLoading:
        defaultPagination?.loading ||
        developmentPagination?.loading ||
        productionPagination?.loading
    }),
    [defaultPagination, developmentPagination, productionPagination]
  )
}
