import { useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { GetRequests } from '../../../graphQL/Queries'
import { usePaginatatedQuery } from '../../../hooks/usePaginatatedQuery'
import OrgRegister from '../Profile/components/OrgRegister'
import RequestTable from './RequestTable'

const Inbox = () => {
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({
    field: '',
    direction: 'DESC'
  })

  const { nodes, paginationProps, reset, refetch } = usePaginatatedQuery(
    GetRequests,
    {
      skip: org !== 'undefined' ? false : true,
      selector: 'requests',
      variables: {
        ...filters
      }
    }
  )

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      {!org || org === 'undefined' ? (
        <OrgRegister />
      ) : (
        <Card>
          <RequestTable
            data={nodes}
            loading={false}
            paginationProps={paginationProps}
            filters={filters}
            setFilters={(newFilters) => {
              setFilters(newFilters)
              reset()
            }}
            refetch={refetch}
          />
        </Card>
      )}
    </Flex>
  )
}

export default Inbox
