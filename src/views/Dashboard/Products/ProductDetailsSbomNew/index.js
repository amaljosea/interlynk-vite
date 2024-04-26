import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProductData } from 'graphQL/Queries'

import SbomInfo from './SbomInfo'
import SbomTable from './SbomTable'

const ProductDetailsSbomNew = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { dispatch } = useGlobalState()
  const { prodVulnDispatch } = dispatch

  const { data, loading, error, refetch } = useQuery(GetProductData, {
    variables: { projectId: productId, sbomId: sbomId },
    onCompleted: (data) => {
      if (data?.sbom?.sbomParts?.length > 0) {
        prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
      }
    }
  })

  return (
    <>
      <SbomInfo
        data={data?.sbom}
        error={error}
        loading={loading}
        refetch={refetch}
      />
      <SbomTable
        data={data?.sbom}
        error={error}
        loading={loading}
        refetch={refetch}
      />
    </>
  )
}

export default ProductDetailsSbomNew
