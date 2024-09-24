import { gql, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect } from 'react'
import { displayErrorMessage } from 'utils'

import {
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Skeleton,
  Text
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import EnvFilter from 'components/Misc/EnvFilter'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import { GetOrgMetrics } from 'graphQL/Queries'

import { FaBug, FaCube, FaLayerGroup, FaWindowMaximize } from 'react-icons/fa'

import ActivitiesOverview from './components/ActivitiesOverview'
import MiniStatistics from './components/MiniStatistics'
import ProductsOverview from './components/ProductsOverview'

const GetOrganization = gql`
  query GetOrganization {
    organization {
      name
      currentUser {
        name
      }
    }
  }
`

export default function Dashboard() {
  const product = useQueryParam('id')
  const { setIsOpen } = useTour()
  const { dispatch, envName } = useGlobalState()
  const { orgView, error } = useGlobalQueryContext()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const { data, loading } = useQuery(GetOrganization, {
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

  if (error) {
    return (
      <LynkAlert
        msg={displayErrorMessage(
          error?.networkError?.statusCode,
          error?.message
        )}
      />
    )
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
    <Flex width={'100%'} flexDirection='column' gap={5}>
      {/* STATS */}
      <Flex width='100%' alignItems={'center'} justifyContent={'space-between'}>
        <Text fontWeight='semibold' fontSize={20}>
          Dashboard
        </Text>
        {orgView && <EnvFilter />}
      </Flex>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing={5}>
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
      <Grid templateColumns='repeat(12, 1fr)' gap={5} flexWrap={'wrap'}>
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
