// Chakra imports
import {
  Flex,
  Grid,
  SimpleGrid,
  useColorModeValue,
  Box
} from '@chakra-ui/react'

import BarChart from 'components/Charts/BarChart'
import LineChart from 'components/Charts/LineChart'

import { FaLayerGroup, FaLink, FaBug, FaImages } from 'react-icons/fa'

import { activitiesData as activitiesOverviewData } from 'variables/general'
import SBOMActivities from './components/ActiveUsers'
import MiniStatistics from './components/MiniStatistics'
import ActivitiesOverview from './components/ActivitiesOverview'
import ProductsOverview from './components/ProductsOverview'
import RiskScoreOverview from './components/SalesOverview'

export default function Dashboard() {
  const iconBoxInside = useColorModeValue('white', 'white')

  return (
    <Flex flexDirection='column' pt={{ base: '120px', md: '70px' }} px={2}>
      <Grid
        templateColumns={{ sm: '1fr', lg: '1fr' }}
        templateRows={{ sm: '1fr', lg: '1fr' }}
        gap='24px'
        mb={{ lg: '26px' }}
      >
        <Box
          bg='blue.600'
          w='100%'
          px={4}
          py={8}
          color='white'
          fontWeight='medium'
          fontSize='20px'
          align='center'
          borderRadius='xl'
          boxShadow='md'
        >
          Metrics dashboard coming soon...
          <br />
          (Samples)
        </Box>
      </Grid>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={'Images'}
          amount={'12'}
          percentage={9}
          icon={<FaImages h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={'Tags'}
          amount={'79'}
          percentage={4}
          icon={<FaLayerGroup h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={'Vulnerabilities'}
          amount={'113'}
          percentage={-8}
          icon={<FaBug h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={'Share Lynks'}
          amount={'8'}
          percentage={14}
          icon={<FaLink h={'24px'} w={'24px'} color={iconBoxInside} />}
        />
      </SimpleGrid>
      <Grid
        templateColumns={{ sm: '1fr', lg: '1.3fr 1.7fr' }}
        templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
        my='26px'
        gap='24px'
        mb={{ lg: '26px' }}
      >
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
      </Grid>
      <Grid
        templateColumns={{ sm: '1fr', md: '1fr 1fr', lg: '2fr 1fr' }}
        templateRows={{ sm: '1fr auto', md: '1fr', lg: '1fr' }}
        my='10px'
        gap='24px'
      >
        <ProductsOverview
          title={'Images overview'}
          amount={10}
          captions={['Product', 'Versions', 'Share Lynks', 'Risk Score']}
        />
        <ActivitiesOverview
          title={'Recent Activities'}
          amount={30}
          data={activitiesOverviewData}
        />
      </Grid>
    </Flex>
  )
}
