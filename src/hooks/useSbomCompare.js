import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { CompareQueryVendor } from 'graphQL/Queries'
import { CompareQueryCustomer } from 'graphQL/Queries'

export const useSbomCompare = ({ sbomIdOne, sbomIdTwo }) => {
  const params = useParams()
  const productId = params.productid
  const signedUrlParams = getSignedUrlParams()

  const { data, loading } = useQuery(
    signedUrlParams ? CompareQueryCustomer : CompareQueryVendor,
    {
      variables: {
        subjectSbomId: sbomIdTwo,
        targetSbomId: sbomIdOne,
        projectId: productId
      }
    }
  )

  const dataResolved = signedUrlParams ? data?.shareLynkQuery : data

  const { sbomOne, sbomTwo, diffs } = dataResolved || {}

  return {
    sbomOne,
    sbomTwo,
    isLoading: loading,
    diffs
  }
}
