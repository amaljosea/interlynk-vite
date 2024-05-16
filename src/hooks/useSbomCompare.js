import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { CompareQueryVendor } from 'graphQL/Queries'
import { CompareQueryCustomer } from 'graphQL/Queries'

export const useSbomCompare = ({ sbomIdOne, sbomIdTwo }) => {
  const params = useParams()
  const productId = params.productid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

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

  console.log({
    data
  })

  return {
    sbomOne,
    sbomTwo,
    isLoading: loading,
    diffs
  }
}
