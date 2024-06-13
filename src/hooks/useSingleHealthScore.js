import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { calculateHealthScore } from './useSbomScores'

const QUERY = gql`
  query SingleSbomHealthScore($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(sbomId: $sbomId, first: 999999999) {
        totalCount
        nodes {
          id
          name
          version
        }
      }
    }
  }
`
const signedUrlParams = sessionStorage.getItem('signedUrlParams')

export const useSingleHealthScore = ({ projectId, sbomId }) => {
  const { data, loading, error } = useQuery(QUERY, {
    skip: sbomId && !signedUrlParams ? false : true,
    variables: {
      projectId,
      sbomId
    }
  })

  const { healthScore } = useMemo(() => {
    const { healthScore = 0 } = calculateHealthScore(data?.sbom)

    return {
      healthScore
    }
  }, [data])

  return {
    loading,
    healthScore,
    error
  }
}
