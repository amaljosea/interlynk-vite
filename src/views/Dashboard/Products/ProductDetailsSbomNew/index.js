import { useQuery } from '@apollo/client'
import { TourProvider } from '@reactour/tour'
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

  const steps = [
    {
      selector: '.search-version',
      content: 'Search SBOM Version'
    },
    {
      selector: '.download',
      content:
        'By clicking this action, users can download a comprehensive inventory of all the components, dependencies, and libraries included in the software'
    },
    {
      selector: '.general',
      content: 'From this tab you can see all the SBOM related details'
    },
    {
      selector: '.components',
      content: 'SBOM Component Details'
    },
    {
      selector: '.vulnerabilities',
      content: 'SBOM Vulnerability Details'
    },
    {
      selector: '.licenses',
      content: 'SBOM License Details'
    }
  ]

  return (
    <TourProvider steps={steps}>
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
    </TourProvider>
  )
}

export default ProductDetailsSbomNew
