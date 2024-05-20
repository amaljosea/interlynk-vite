import { useState } from 'react'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({})

  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    GetPolicies,
    {
      skip: org !== 'undefined' ? false : true,
      selector: 'policies',
      variables: {
        ...filters
      }
    }
  )

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
          <PolicyTable
            loading={loading}
            data={nodes}
            refetch={refetch}
            paginationProps={paginationProps}
          />
        </Card>
      )}
    </Flex>
  )
}

export default Policies
