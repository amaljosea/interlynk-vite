/* eslint-disable no-undef */
import { useQuery } from '@apollo/client'
import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import {
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import { GetOrg, GetOrgMetrics } from 'graphQL/Queries'

import { FaBug, FaCube, FaLayerGroup, FaWindowMaximize } from 'react-icons/fa'

import OrgRegister from '../Profile/components/OrgRegister'
import ActivitiesOverview from './components/ActivitiesOverview'
import MiniStatistics from './components/MiniStatistics'
import ProductsOverview from './components/ProductsOverview'

export default function Dashboard() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const { dispatch, envName, userPermissions } = useGlobalState()
  const { orgView, orgLoading } = useGlobalQueryContext()
  const { prodCompDispatch, prodVulnDispatch } = dispatch
  const iconBoxInside = useColorModeValue('white', 'white')

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const {
    data,
    error: eOrg,
    loading
  } = useQuery(GetOrg, {
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

  const { data: metrics, error: eOrgMetric } = useQuery(GetOrgMetrics, {
    skip:
      data?.organization?.name && productPermissions === true ? false : true,
    variables: { env: envName }
  })

  useEffect(() => {
    if (product === null) {
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product])

  if (eOrg || eOrgMetric) return <OrgRegister />

  if (!orgView) {
    return <ViewAlert loading={orgLoading} category='dashboar page' />
  }

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
          amount={metrics?.organizationMetric?.projectCount}
          icon={
            <FaWindowMaximize h={'24px'} w={'24px'} color={iconBoxInside} />
          }
        />
        <MiniStatistics
          title={'Versions'}
          amount={metrics?.organizationMetric?.versionCount}
          icon={<FaLayerGroup h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={'Components'}
          amount={metrics?.organizationMetric?.componentCount}
          icon={<FaCube h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={'Vulnerabilities'}
          amount={metrics?.organizationMetric?.vulnsMetric}
          icon={<FaBug h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
      </SimpleGrid>
      {/* LIST */}
      <Grid templateColumns='repeat(12, 1fr)' gap={'24px'} flexWrap={'wrap'}>
        {/* RECENT IMPORTS */}
        <GridItem colSpan={8} w='100%'>
          <ProductsOverview
            title={'Recent Imports'}
            data={metrics?.organizationMetric?.latestVersions}
            prodPermissions={productPermissions}
          />
        </GridItem>
        {/* LATEST ACTIVITIES */}
        <GridItem colSpan={4} w='100%'>
          <ActivitiesOverview
            title={'Recent Activities'}
            amount={metrics?.organizationMetric?.latestActivity?.length}
            data={metrics?.organizationMetric?.latestActivity}
            prodPermissions={productPermissions}
          />
        </GridItem>
      </Grid>
    </Flex>
  )
}
