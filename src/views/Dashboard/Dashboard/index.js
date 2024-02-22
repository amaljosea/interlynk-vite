// Chakra imports
import {
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react'
import BarChart from 'components/Charts/BarChart'
import LineChart from 'components/Charts/LineChart'
import { FaLayerGroup, FaBug, FaCube, FaWindowMaximize } from 'react-icons/fa'
import SBOMActivities from './components/ActiveUsers'
import MiniStatistics from './components/MiniStatistics'
import ActivitiesOverview from './components/ActivitiesOverview'
import ProductsOverview from './components/ProductsOverview'
import RiskScoreOverview from './components/SalesOverview'
import { GetOrg } from 'graphQL/Queries'
import { useQuery } from '@apollo/client'
import OrgRegister from '../Profile/components/OrgRegister'
import { useEffect } from 'react'
import { GetOrgMetrics } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLocation } from 'react-router-dom'
import { displayErrorMessage } from 'utils'
import { Text } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
import CustomLoader from 'components/CustomLoader'
import Card from 'components/Card/Card'

export default function Dashboard() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('id')
  const { dispatch, envName } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const iconBoxInside = useColorModeValue('white', 'white')

  const {
    data,
    error: eOrg,
    loading
  } = useQuery(GetOrg, {
    skip: data === undefined ? false : true,
    onCompleted: (data) => {
      console.log('Get organization')
      localStorage.setItem('organization', data?.organization?.name)
    }
  })

  const { data: metrics, error: eOrgMetric } = useQuery(GetOrgMetrics, {
    skip: metrics === undefined ? false : true,
    variables: { env: envName }
  })

  useEffect(() => {
    if (product === null) {
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [product])

  if (eOrg) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'} gap={2}>
        <WarningTwoIcon color='blue.500' />
        <Text textAlign={'center'} fontSize={14}>
          {displayErrorMessage(eOrg.networkError?.statusCode, eOrg.message)}
        </Text>
      </Flex>
    )
  }

  if (eOrgMetric) {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        gap={'24px'}
        pr={2}
        pl={5}
      >
        <OrgRegister />
      </Flex>
    )
  }

  if (loading) {
    return (
      <Flex
        flexDirection='column'
        pt={{ base: '120px', md: '74px' }}
        gap={'24px'}
        pr={2}
        pl={5}
      >
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
    <>
      {data && (
        <Flex
          width={'100%'}
          flexDirection='column'
          pt={{ base: '120px', md: '74px' }}
          pr={2}
          pl={5}
        >
          {data.organization ? (
            <Flex flexDirection='column'>
              {/* STATS */}
              <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
                <MiniStatistics
                  title={'Products'}
                  amount={metrics?.organizationMetric?.projectCount}
                  percentage={9}
                  icon={
                    <FaWindowMaximize
                      h={'24px'}
                      w={'24px'}
                      color={iconBoxInside}
                    />
                  }
                />
                <MiniStatistics
                  title={'Versions'}
                  amount={metrics?.organizationMetric?.versionCount}
                  icon={
                    <FaLayerGroup h={'24px'} w={'24px'} color={iconBoxInside} />
                  }
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
              {/* GRAPHS */}
              <Grid
                templateColumns={{ sm: '1fr', lg: '1.3fr 1.7fr' }}
                templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
                mb={{ lg: '26px' }}
                gap='24px'
              >
                {/* TODO: 1.0 Add back in when ready
                <RiskScoreOverview
                  title={'Risk Score'}
                  percentage={-24}
                  chart={<LineChart />}
                />
                <SBOMActivities
                  title={'Activities'}
                  percentage={23}
                  chart={<BarChart />}
                />
                */}
              </Grid>
              {/* LIST */}
              <Grid
                templateColumns='repeat(12, 1fr)'
                gap={'24px'}
                flexWrap={'wrap'}
              >
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
          ) : (
            <OrgRegister />
          )}
        </Flex>
      )}
    </>
  )
}
