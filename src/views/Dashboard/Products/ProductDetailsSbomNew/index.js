import { useMutation, useQuery } from '@apollo/client'
import { TourProvider } from '@reactour/tour'
import { useParams } from 'react-router-dom'
import { tourStyles } from 'utils'

import { useGlobalState } from 'hooks/useGlobalState'

import { CurrentUserFlagSet } from 'graphQL/Mutation'
import { GetProductData } from 'graphQL/Queries'

import SbomInfo from './SbomInfo'
import SbomTable from './SbomTable'

const ProductDetailsSbomNew = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { dispatch } = useGlobalState()
  const { prodVulnDispatch } = dispatch

  const [updateTour] = useMutation(CurrentUserFlagSet)

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

  const onTourUpdate = (value) => {
    updateTour({
      variables: { flags: ['sbomDetailsOnboardingCompleted'] }
    }).then((res) => res?.data && value.setIsOpen(false))
  }

  return (
    <TourProvider
      steps={steps}
      styles={tourStyles}
      onClickClose={(value) => onTourUpdate(value)}
      onClickMask={(value) => onTourUpdate(value)}
    >
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
