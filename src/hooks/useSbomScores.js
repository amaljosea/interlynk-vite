import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'
import { useMemo } from 'react'
import { getComponentHealthScoreFromLocalData } from 'utils/getComponentHealthScoreFromLocalData'

const QUERY = gql`
  query Organization($projectId: Uuid!, $sbomId: Uuid!) {
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
      unresolvedCheckResults: checkResults(
        sbomId: $sbomId
        status: ["unresolved"]
      ) {
        totalCount
      }
    }
  }
`
const signedUrlParams = sessionStorage.getItem('signedUrlParams')
const SBOM_LEVEL_CHECKS_COUNT = 7
const COMPONENT_LEVEL_CHECKS_COUNT = 13

const calculateQualityScore = (data) => {
  if (!data) {
    return {
      qualityScore: null
    }
  }
  const componentsCount = data.sbom.components.totalCount
  const maxScore =
    SBOM_LEVEL_CHECKS_COUNT + componentsCount * COMPONENT_LEVEL_CHECKS_COUNT
  const unresolvedCheckResultsCount =
    data.sbom.unresolvedCheckResults.totalCount
  const currentScore = maxScore - unresolvedCheckResultsCount
  const percentageScore = (currentScore * 100) / maxScore

  return { qualityScore: round(percentageScore, 1) }
}

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
      sbomId
    }
  })

  const { qualityScore, healthScore } = useMemo(() => {
    const { qualityScore } = calculateQualityScore(data)
    const { healthScore } = calculateHealthScore(data)

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
