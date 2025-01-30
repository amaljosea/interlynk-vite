/* eslint-disable no-restricted-syntax */
import { useQuery } from '@apollo/client'

import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'

import LynkPieChart from 'components/Charts/LynkPieChart'

import { useGlobalState } from 'hooks/useGlobalState'

import { getAllPolicies } from 'graphQL/Queries'

const PolicyGraphs = () => {
  const { organization } = useGlobalState()

  // -------------- POLICY RESULTS ---------------------
  const { data: informPolicies, loading: policyLoading } = useQuery(
    getAllPolicies,
    {
      skip: organization ? false : true,
      variables: {
        resultType: ['inform']
      }
    }
  )
  const { data: warnPolicies } = useQuery(getAllPolicies, {
    skip: organization ? false : true,
    variables: {
      resultType: ['warn']
    }
  })
  const { data: failPolicies } = useQuery(getAllPolicies, {
    skip: organization ? false : true,
    variables: {
      resultType: ['fail']
    }
  })

  // -------------- POLICY VIOLATIONS ---------------------
  const policyResults = [
    {
      name: 'Inform',
      value: informPolicies?.policies?.totalCount,
      color: '#3182ce'
    },
    {
      name: 'Warn',
      value: warnPolicies?.policies?.totalCount,
      color: '#D69E2E'
    },
    {
      name: 'Fail',
      value: failPolicies?.policies?.totalCount,
      color: '#E53E3E'
    }
  ]

  return (
    <Stack spacing={4} mt={6}>
      <Heading size={'md'}>Policies</Heading>
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={5}>
        <LynkPieChart
          loading={policyLoading}
          title='Policy Results'
          data={policyResults}
        />
      </SimpleGrid>
    </Stack>
  )
}

export default PolicyGraphs
