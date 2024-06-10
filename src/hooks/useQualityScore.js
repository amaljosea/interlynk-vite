import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'

const QUERY = gql`
  query Organization($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      components(sbomId: $sbomId) {
        totalCount
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
      qualityScore: null,
      maxScore: null,
      currentScore: null
    }
  }
  const componentsCount = data.sbom.components.totalCount
  const maxScore =
    SBOM_LEVEL_CHECKS_COUNT + componentsCount * COMPONENT_LEVEL_CHECKS_COUNT
  const unresolvedCheckResultsCount =
    data.sbom.unresolvedCheckResults.totalCount
  const currentScore = maxScore - unresolvedCheckResultsCount
  const percentageScore = (currentScore * 100) / maxScore

  return { qualityScore: round(percentageScore, 1), maxScore, currentScore }
}

export const useQualityScore = ({ projectId, sbomId }) => {
  // console.log({ projectId, sbomId })
  const { data, loading } = useQuery(QUERY, {
    skip: sbomId && !signedUrlParams ? false : true,
    variables: {
      projectId,
      sbomId
    }
  })

  const scores = calculateQualityScore(data)
  return {
    loading,
    ...scores
  }
}
