import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useParams } from 'react-router-dom'

import { ShareProductData } from 'graphQL/Queries'

import SbomInfo from './SbomInfo'
import SbomTable from './SbomTable'

const ProductDetailsSbomNew = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { setIsOpen, setCurrentStep } = useTour()

  const { data, loading, error, refetch } = useQuery(ShareProductData, {
    variables: { projectId: productId, sbomId: sbomId },
    onCompleted: (data) => {
      const tour = localStorage.getItem('tourCompleted')
      if (data && tour === 'false') {
        setTimeout(() => {
          setCurrentStep(3)
          setIsOpen(true)
        }, 1000)
      }
    }
  })

  return (
    <>
      <SbomInfo
        data={data?.shareLynkQuery?.sbom}
        error={error}
        loading={loading}
      />
      <SbomTable
        data={data?.shareLynkQuery?.sbom}
        error={error}
        loading={loading}
      />
    </>
  )
}

export default ProductDetailsSbomNew
