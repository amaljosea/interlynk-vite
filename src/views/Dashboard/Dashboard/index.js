import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { Flex, Grid, GridItem, SimpleGrid, Skeleton } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

import { GetOrg, GetOrgMetrics } from 'graphQL/Queries'

import { FaBug, FaCube, FaLayerGroup, FaWindowMaximize } from 'react-icons/fa'

import ActivitiesOverview from './components/ActivitiesOverview'
import MiniStatistics from './components/MiniStatistics'
import ProductsOverview from './components/ProductsOverview'

export default function Dashboard() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const { setIsOpen } = useTour()
  const { dispatch, envName } = useGlobalState()
  const { orgView } = useGlobalQueryContext()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const { data, loading } = useQuery(GetOrg, {
    skip: !orgView,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data) {
        localStorage.setItem('organization', data?.organization?.name)
        localStorage.setItem(
          'isSuperAdmin',
          data?.organization?.currentUser?.superAdmin
        )
      }
    }
  })

  const { data: metrics } = useQuery(GetOrgMetrics, {
    skip: data?.organization?.name ? false : true,
    variables: { env: envName }
  })

  const { projectCount, versionCount, componentCount, vulnsMetric } =
    metrics?.organizationMetric || ''

  useEffect(() => {
    if (product === null) {
      setIsOpen(false)
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product, setIsOpen])

  if (loading) {
    return (
      <Flex width={'100%'} flexDirection='column' gap={6}>
        <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index}>
              <Flex width={'100%'} gap={3} direction={'column'} mt={1}>
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
        <Grid
          templateColumns={{ sm: '1fr', md: '1fr 1fr', lg: '2fr 1fr' }}
          templateRows={{ sm: '1fr auto', md: '1fr', lg: '1fr' }}
          gap='24px'
        >
          {[1, 2].map((_, index) => (
            <Card key={index}>
              <CustomLoader />
            </Card>
          ))}
        </Grid>
      </Flex>
    )
  }

  return (
    <Flex width={'100%'} flexDirection='column' gap={6}>
      {/* STATS */}
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={'Products'}
          amount={projectCount}
          icon={<FaWindowMaximize />}
        />
        <MiniStatistics
          title={'Versions'}
          amount={versionCount}
          icon={<FaLayerGroup />}
        />
        <MiniStatistics
          title={'Components'}
          amount={componentCount}
          icon={<FaCube />}
        />
        <MiniStatistics
          title={'Vulnerabilities'}
          amount={vulnsMetric}
          icon={<FaBug />}
        />
      </SimpleGrid>
      {/* LIST */}
      <Grid templateColumns='repeat(12, 1fr)' gap={'24px'} flexWrap={'wrap'}>
        {/* RECENT IMPORTS */}
        <GridItem colSpan={8} w='100%'>
          <ProductsOverview
            title={'Recent Imports'}
            data={metrics?.organizationMetric?.latestVersions}
          />
        </GridItem>
        {/* LATEST ACTIVITIES */}
        <GridItem colSpan={4} w='100%'>
          <ActivitiesOverview
            title={'Recent Activities'}
            amount={metrics?.organizationMetric?.latestActivity?.length}
            data={metrics?.organizationMetric?.latestActivity}
          />
        </GridItem>
      </Grid>
    </Flex>
  )
}
