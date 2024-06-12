import { useState } from 'react'

import Card from 'components/Card/Card'

import { GetRequests } from '../../../graphQL/Queries'
import { usePaginatatedQuery } from '../../../hooks/usePaginatatedQuery'
import OrgRegister from '../Profile/components/OrgRegister'
import RequestTable from './RequestTable'

const Inbox = () => {
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({
    field: 'REQUESTS_REQUESTED_AT',
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

  if (!org || org === 'undefined') return <OrgRegister />

  return (
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
  )
}

export default Inbox
