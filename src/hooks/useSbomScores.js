import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'
import { useMemo } from 'react'
import { getSignedUrlParams } from 'utils'
import { getComponentHealthScoreFromLocalData } from 'utils/getComponentHealthScoreFromLocalData'

const QUERY = gql`
  query SingleSbomScore(
    $projectId: Uuid!
    $sbomId: Uuid!
    $sbomIds: [ID!]!
    $reportFormat: ComplianceReportFormat
  ) {
    complianceReports(sbomIds: $sbomIds, reportFormat: $reportFormat) {
      nodes {
        score
        reportFormat
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
const signedUrlParams = getSignedUrlParams()

export const calculateHealthScore = (sbom) => {
  if (!sbom) {
    return {
      healthScore: 0
    }
  }

  const healthScores = sbom.components.nodes.map(
    (node) =>
      getComponentHealthScoreFromLocalData({
        componentName: node.name,
        componentVersion: node.version
      }).healthScore
  )
  const sum = healthScores.reduce((acc, hs) => {
    return acc + hs
  }, 0)

  const componentsCount = sbom.components.totalCount

  return {
    healthScore: round(sum / componentsCount, 2)
  }
}

export const useSbomScores = ({ projectId, sbomId, format }) => {
  const { data, loading } = useQuery(QUERY, {
    skip: sbomId && !signedUrlParams ? false : true,
    variables: {
      projectId,
      sbomId,
      sbomIds: [sbomId],
      reportFormat: format
    }
  })

  const { qualityScore, healthScore, reportFormat } = useMemo(() => {
    const reportFormat = data?.complianceReports?.nodes[0]?.reportFormat || ''
    const qualityScore = round(data?.complianceReports?.nodes[0]?.score, 2) || 0
    const { healthScore = 0 } = calculateHealthScore(data?.sbom)

    return {
      qualityScore,
      healthScore,
      reportFormat
    }
  }, [data])

  return {
    loading,
    qualityScore,
    healthScore,
    reportFormat
  }
}
