import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const org = localStorage.getItem('organization')
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const [getPolicyData, { data }] = useLazyQuery(GetPolicies)

  useEffect(() => {
    if (org !== 'undefined' && data === undefined) {
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
      {!org || org === 'undefined' ? (
        <OrgRegister />
      ) : (
        <Card>
          <PolicyTable data={data?.policies} refetch={getPolicyData} />
        </Card>
      )}
    </Flex>
  )
}

export default Policies
