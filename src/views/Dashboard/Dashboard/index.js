/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useEffect, useState } from 'react'

import { Button, Flex, Heading, Skeleton, Stack } from '@chakra-ui/react'
import { Grid, GridItem, SimpleGrid } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'
import GlobalLabelFilter from 'components/Misc/GlobalLabelFilter'

import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import { GetOrgMetrics } from 'graphQL/Queries'

import ActivitiesOverview from './components/ActivitiesOverview'
import ProductsOverview from './components/ProductsOverview'
import PolicyGraphs from './components/category/PolicyGraphs'
import ProductGraphs from './components/category/ProductGraphs'
import VulnGraphs from './components/category/VulnGraphs'

export default function Dashboard() {
  const { setIsOpen } = useTour()
  const product = useQueryParam('id')
  const { dispatch, envName, organization } = useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const [labelIds, setLabelIds] = useState([])

  const { data: metrics, loading } = useQuery(GetOrgMetrics, {
    skip: organization ? false : true,
    variables: { env: envName }
  })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate?.getDate() - 7)

  useEffect(() => {
    if (product === null) {
      setIsOpen(false)
      prodCompDispatch({ type: 'CLEAR_PROD_COMP' })
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodCompDispatch, prodVulnDispatch, product, setIsOpen])

  if (!organization) {
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
      {/* FILTERS */}
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Button
          fontSize='sm'
          fontWeight={'medium'}
          colorScheme='blue'
          textTransform={'capitalize'}
          _hover={{ colorScheme: 'blue' }}
          _active={{ colorScheme: 'blue' }}
        >
          {envName}
        </Button>
        <Flex gap={2} alignItems={'center'}>
          {/* LABEL FILTER */}
          <GlobalLabelFilter value={labelIds} setValue={setLabelIds} />
          {/* ENVIRONMENT FILTER */}
          {organization && <GlobalEnvFilter />}
        </Flex>
      </Flex>
      {/* PRODUCTS GRAPHS */}
      <ProductGraphs />
      {/* VULNERABILITIRS GRAPHS */}
      <VulnGraphs labelIds={labelIds} />
      {/* POLICY GRAPHS */}
      <PolicyGraphs />
      {/* ACTIVITIES AND CHANGELOGS */}
      <Stack spacing={4} mt={6}>
        <Heading size={'md'}>Activities</Heading>
        <Grid templateColumns='repeat(12, 1fr)' gap={5} flexWrap={'wrap'}>
          {/* RECENT IMPORTS */}
          <GridItem colSpan={8} w='100%'>
            <ProductsOverview
              loading={loading}
              title={'Recent Imports'}
              data={metrics?.organizationMetric?.latestVersions}
            />
          </GridItem>
          {/* LATEST ACTIVITIES */}
          <GridItem colSpan={4} w='100%'>
            <ActivitiesOverview
              loading={loading}
              title={'Recent Activities'}
              amount={metrics?.organizationMetric?.latestActivity?.length}
              data={metrics?.organizationMetric?.latestActivity}
            />
          </GridItem>
        </Grid>
      </Stack>
    </Flex>
  )
}
