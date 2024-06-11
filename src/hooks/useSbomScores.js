import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'
import { useMemo } from 'react'
import { getComponentHealthScoreFromLocalData } from 'utils/getComponentHealthScoreFromLocalData'

const QUERY = gql`
  query Organization($projectId: Uuid!, $sbomId: Uuid!, $sbomIds: [ID!]!) {
    complianceReports(sbomIds: $sbomIds, reportFormat: NTIA) {
      nodes {
        score
      }
    }
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

const calculateHealthScore = (data) => {
  if (!data) {
    return {
      healthScore: 0
    }
  }

  const healthScores = data.sbom.components.nodes.map(
    (node) =>
      getComponentHealthScoreFromLocalData({
        componentName: node.name,
        componentVersion: node.version
      }).healthScore
  )
  const sum = healthScores.reduce((acc, hs) => {
    return acc + hs
  }, 0)

  const componentsCount = data.sbom.components.totalCount

  return {
    healthScore: round(sum / componentsCount, 2)
  }
}

export const useSbomScores = ({ projectId, sbomId }) => {
  const { data, loading } = useQuery(QUERY, {
    skip: sbomId && !signedUrlParams ? false : true,
    variables: {
      projectId,
      sbomId,
      sbomIds: [sbomId]
    }
  })

  const { qualityScore, healthScore } = useMemo(() => {
    const qualityScore = round(data?.complianceReports?.nodes[0]?.score, 2) || 0
    const { healthScore = 0 } = calculateHealthScore(data)

    return {
      qualityScore,
      healthScore
    }
  }, [data])

  return {
    loading,
    qualityScore,
    healthScore
  }
}
