import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, GridItem, SimpleGrid } from '@chakra-ui/react'

import ComponentParts from 'components/Graphs/ComponentParts'
import LicenseParts from 'components/Graphs/LicenseParts'
import PolicyParts from 'components/Graphs/PolicyParts'
import VulnParts from 'components/Graphs/VulnParts'

import { useGradualPolling } from 'hooks/useGradualPolling'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetProductData } from 'graphQL/Queries'
import { GetProjectSettings, PolicyResultsType } from 'graphQL/Queries'

import SbomInfo from './SbomInfo'
import SbomTable from './SbomTable'

const ProductDetailsSbomNew = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTour = localStorage.getItem('activeTour')

  const { setIsOpen, setCurrentStep } = useTour()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const { data, loading, error, startPolling, stopPolling } = useQuery(
    GetProductData,
    { variables: { projectId: productId, sbomId: sbomId } }
  )

  const { vulnRunStatus } = data?.sbom || {}

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: productId }
  })

  const { projectSetting } = settings?.project || {}
  const { vulnScanningEnabled: vulnScan } = projectSetting || {}
  const reScanVuln = vulnScan === true && vulnRunStatus !== 'FINISHED'

  const { data: policies } = useQuery(PolicyResultsType, {
    skip: sbomId ? false : true,
    variables: { sbomId: sbomId, first: 100 }
  })

  const { nodes } = policies?.policyResults || ''
  const isInitialized = nodes?.some((item) => item?.result === 'initialized')

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

  const shouldPoll = reScanVuln || isInitialized

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  return (
    <Flex width={'100%'} flexDir={'column'} gap={5}>
      <SbomInfo data={data?.sbom} error={error} loading={loading} />
      <SimpleGrid
        gap={4}
        width={'100%'}
        alignItems={'flex-start'}
        templateColumns='repeat(12, 1fr)'
      >
        <GridItem colSpan={[3, 4]}>
          <ComponentParts />
        </GridItem>
        <GridItem hidden colSpan={3}>
          <LicenseParts />
        </GridItem>
        <GridItem colSpan={[5, 4]}>
          <VulnParts />
        </GridItem>
        <GridItem colSpan={4}>
          <PolicyParts />
        </GridItem>
      </SimpleGrid>
      <SbomTable data={data?.sbom} error={error} loading={loading} />
    </Flex>
  )
}

export default ProductDetailsSbomNew
