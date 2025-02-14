/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import LynkPieChart from 'components/Charts/LynkPieChart'

import { useGlobalState } from 'hooks/useGlobalState'

import { getAllPolicies } from 'graphQL/Queries'

const PolicyGraphs = () => {
  const { organization } = useGlobalState()

  const { data, loading } = useQuery(getAllPolicies, {
    skip: !organization
  })

  const policyResults = [
    {
      name: 'Inform',
      value: data?.informPolicies?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Warn',
      value: data?.warnPolicies?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'Fail',
      value: data?.failPolicies?.totalCount,
      color: '#E53E3E'
    }
  ]

  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Policies</Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <LynkPieChart
          loading={loading}
          title='Policy Results'
          data={policyResults}
        />
      </SimpleGrid>
    </Stack>
  )
}

export default PolicyGraphs
