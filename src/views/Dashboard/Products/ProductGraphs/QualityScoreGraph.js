import { gql, useQuery } from '@apollo/client'
import { round } from 'lodash'

import { Box } from '@chakra-ui/react'

import { SimpleBarChat } from './utils'

const QUERY_QUALITY_SCORE = gql`
  query QualityScoreQuery($sbomIds: [ID!]!) {
    complianceReports(sbomIds: $sbomIds, reportFormat: NTIA) {
      nodes {
        score
      }
    }
  }
`

export const QualityScoreGraph = ({ sbomIds }) => {
  const { data, loading, error } = useQuery(QUERY_QUALITY_SCORE, {
    variables: {
      sbomIds
    }
  })

  console.log({ error })

  if (error) {
    return 'Error!'
  }

  if (loading) {
    return <Box mt={8}>Loading...</Box>
  }

  const formattedScores =
    data?.complianceReports?.nodes.map((i) => ({
      score: round(i.score, 2)
    })) || []

  const nodesBReversed = [...(formattedScores || [])].reverse()

  return (
    <>
      <SimpleBarChat
        color='#3182ce'
        label={'Quality Score'}
        dataKey='score'
        data={nodesBReversed}
      />
    </>
  )
}
