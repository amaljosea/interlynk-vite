// Chakra imports
import { Flex, Grid, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
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

export default function Dashboard() {
  const iconBoxInside = useColorModeValue('white', 'white')

  const { data } = useQuery(GetOrg)
  const { data: metrics } = useQuery(GetOrgMetrics)

  useEffect(() => {
    if (data) {
      localStorage.setItem(
        'organization',
        JSON.stringify(data?.organization?.name)
      )
    }
  }, [data])

  useEffect(() => {
    if (metrics) {
      console.log('Matrics', metrics)
    }
  }, [metrics])

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
                my='26px'
                gap='24px'
                mb={{ lg: '26px' }}
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
                templateColumns={{ sm: '1fr', md: '1fr 1fr', lg: '2fr 1fr' }}
                templateRows={{ sm: '1fr auto', md: '1fr', lg: '1fr' }}
                gap='24px'
              >
                {/* RECENT IMPORTS */}
                <ProductsOverview
                  title={'Recent Imports'}
                  amount={10}
                  captions={[
                    'Product',
                    'Version',
                    'Compoents',
                    'Licenses',
                    'Vulnerabilities',
                    'Imported'
                  ]}
                  data={metrics?.organizationMetric?.latestVersions}
                />
                {/* LATEST ACTIVITIES */}
                <ActivitiesOverview
                  title={'Recent Activities'}
                  amount={metrics?.organizationMetric?.latestActivity?.length}
                  data={metrics?.organizationMetric?.latestActivity}
                />
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
