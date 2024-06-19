import { useParams } from 'react-router-dom'

import { Center } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useSingleHealthScore } from 'hooks/useSingleHealthScore'

import { SimpleBarChat } from './utils'

export const HealthScoreGraph = ({ sbomIds }) => {
  const params = useParams()
  const productId = params.productid
  const {
    healthScore: score0,
    loading: loading0,
    error: error0
  } = useSingleHealthScore({
    sbomId: sbomIds[0],
    projectId: productId
  })
  const {
    healthScore: score1,
    loading: loading1,
    error: error1
  } = useSingleHealthScore({
    sbomId: sbomIds[1],
    projectId: productId
  })

  const {
    healthScore: score2,
    loading: loading2,
    error: error2
  } = useSingleHealthScore({
    sbomId: sbomIds[2],
    projectId: productId
  })

  const {
    healthScore: score3,
    loading: loading3,
    error: error3
  } = useSingleHealthScore({
    sbomId: sbomIds[3],
    projectId: productId
  })

  const {
    healthScore: score4,
    loading: loading4,
    error: error4
  } = useSingleHealthScore({
    sbomId: sbomIds[4],
    projectId: productId
  })

  if (loading0 || loading1 || loading2 || loading3 || loading4) {
    return <Center as={Card}>Loading...</Center>
  }

  if (error0 || error1 || error2 || error3 || error4) {
    return <Center as={Card}>Error!</Center>
  }

  const combinedData = [
    {
      score: score0
    },
    {
      score: score1
    },
    {
      score: score2
    },
    {
      score: score3
    },
    {
      score: score4
    }
  ]

  const combinedDataFiltered = sbomIds.map((i, index) => combinedData[index])

  return (
    <SimpleBarChat
      color='#3182ce'
      label={'Health Score'}
      dataKey='score'
      data={combinedDataFiltered}
    />
  )
}
