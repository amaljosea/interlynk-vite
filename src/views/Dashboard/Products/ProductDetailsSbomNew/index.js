import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetProductData } from 'graphQL/Queries'

import SbomInfo from './SbomInfo'
import SbomTable from './SbomTable'

const ProductDetailsSbomNew = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTour = localStorage.getItem('activeTour')

  const { dispatch } = useGlobalState()
  const { prodVulnDispatch } = dispatch

  const { setIsOpen, setCurrentStep } = useTour()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { data, loading, error, refetch } = useQuery(GetProductData, {
    variables: { projectId: productId, sbomId: sbomId },
    onCompleted: (data) => {
      if (data?.sbom?.sbomParts?.length > 0) {
        prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
      }
    }
  })

  useEffect(() => {
    if (shouldShowDemoFeatures) {
      if (activeTour === 'products') {
        document?.body?.classList.add('no-scroll')
        if (data) {
          setCurrentStep(7)
          setIsOpen(true)
        }
      } else {
        document?.body?.classList.remove('no-scroll')
        setIsOpen(false)
      }
    }
  }, [data, activeTour, setCurrentStep, setIsOpen, shouldShowDemoFeatures])

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
