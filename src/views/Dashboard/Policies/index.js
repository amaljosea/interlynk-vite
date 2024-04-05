import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const [getPolicyData, { data }] = useLazyQuery(GetPolicies, {
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data === undefined) {
      getPolicyData({
        variables: {
          search: searchInput === '' ? undefined : searchInput,
          first: totalRows
        }
      }).then((res) => res?.data && console.log('Policy data', res.data))
    }
  }, [])

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      gap={6}
      pr={2}
      pl={5}
    >
      <Card>
        <PolicyTable data={data?.policies} refetch={getPolicyData} />
      </Card>
    </Flex>
  )
}

export default Policies
