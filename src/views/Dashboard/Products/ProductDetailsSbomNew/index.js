import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Flex, Grid, GridItem } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { GetProductData } from 'graphQL/Queries'
import { GetProjectSettings, PolicyResultsType } from 'graphQL/Queries'

import { FaBalanceScale } from 'react-icons/fa'
import { FaBug, FaCube } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'

import SbomStats from './SbomDetails/SbomStats'
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

  const { data, loading, error } = useQuery(GetProductData, {
    variables: { projectId: productId, sbomId: sbomId },
    onCompleted: (data) => {
      if (data?.sbom?.sbomParts?.length > 0) {
        prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
      }
    }
  })

  const { stats, vulnRunStatus } = data?.sbom || ''
  const {
    compCount,
    compLicenseCount,
    vulnStats,
    sbomParts,
    policyResultMetrics
  } = stats || ''

  const { data: settings } = useQuery(GetProjectSettings, {
    variables: { id: productId }
  })

  const { projectSetting } = settings?.project || ''
  const { vulnScanningEnabled: vulnScan } = projectSetting || ''
  const reScanVuln = vulnScan === true && vulnRunStatus !== 'FINISHED'

  const { data: policies, refetch: policyRefetch } = useQuery(
    PolicyResultsType,
    {
      skip: sbomId ? false : true,
      variables: { sbomId: sbomId, first: 100 }
    }
  )

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

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      if (isInitialized) {
        policyRefetch()
        refetchActiveQueries()
      } else {
        clearInterval(refetchInterval)
      }
    }, 15000)
    return () => clearInterval(refetchInterval)
  }, [sbomId, isInitialized, policyRefetch])

  useEffect(() => {
    const refetchInterval = setInterval(() => {
      if (reScanVuln) {
        refetchActiveQueries()
      } else if (isInitialized) {
        policyRefetch()
        refetchActiveQueries()
      } else {
        clearInterval(refetchInterval)
      }
    }, 15000)
    return () => clearInterval(refetchInterval)
  }, [sbomId, reScanVuln, isInitialized, policyRefetch])

  return (
    <Flex width={'100%'} flexDir={'column'} gap={5}>
      <SbomInfo data={data?.sbom} error={error} loading={loading} />
      <Grid
        gap={4}
        width={'100%'}
        alignItems={'flex-start'}
        templateColumns='repeat(12, 1fr)'
      >
        <GridItem colSpan={3}>
          <SbomStats
            title={'Components'}
            amount={compCount}
            icon={<FaCube size={20} />}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <SbomStats
            title={'Licenses'}
            amount={compLicenseCount}
            icon={<FaBalanceScale size={20} />}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <SbomStats
            amount={vulnStats}
            sbomParts={sbomParts}
            status={vulnRunStatus}
            title={'Vulnerabilities'}
            icon={<FaBug size={20} />}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <SbomStats
            title={'Policy Results'}
            amount={policyResultMetrics}
            icon={<MdPolicy size={20} />}
          />
        </GridItem>
      </Grid>
      <SbomTable data={data?.sbom} error={error} loading={loading} />
    </Flex>
  )
}

export default ProductDetailsSbomNew
