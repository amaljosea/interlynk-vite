/* eslint-disable no-restricted-syntax */
import { useTour } from '@reactour/tour'
import { useEffect } from 'react'

import { Button, Flex, Skeleton, Stack } from '@chakra-ui/react'
import { Grid, SimpleGrid } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardList from 'components/CardList'
import CustomLoader from 'components/CustomLoader'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'
import GlobalLabelFilter from 'components/Misc/GlobalLabelFilter'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import Activities from './activities'
import PolicyGroup from './policies'
import ProductGroup from './products'
import VulnerabilityTrendsGroup from './trends'
import VulnerabilityGroup from './vulnerabilities'

export default function Page() {
  const { setIsOpen } = useTour()
  const product = useQueryParam('id')
  const { isFreeTier } = useGlobalQueryContext()
  const { dispatch, envName, organization, labelIds, setLabelIds } =
    useGlobalState()
  const { prodCompDispatch, prodVulnDispatch } = dispatch

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
    <Stack width={'100%'} spacing={10}>
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
          cursor={'auto'}
        >
          {envName}
        </Button>
        <Flex gap={2} alignItems={'center'}>
          {/* LABEL FILTER */}
          <GlobalLabelFilter value={labelIds} setValue={setLabelIds} />
          {/* ENVIRONMENT FILTER */}
          {organization && <GlobalEnvFilter />}
          {/* GRAPH CARD LIGHT */}
          {!isFreeTier && <CardList />}
        </Flex>
      </Flex>
      <Stack spacing={10} pb={4}>
        {/* PRODUCTS GRAPHS */}
        <ProductGroup />
        {/* VULNERABILITIRS GRAPHS */}
        <VulnerabilityGroup />
        {/* VULNERABILITY TRENDS GRAPHS */}
        <VulnerabilityTrendsGroup />
        {/* POLICY GRAPHS */}
        <PolicyGroup />
        {/* ACTIVITIES AND CHANGELOGS */}
        <Activities />
      </Stack>
    </Stack>
  )
}
