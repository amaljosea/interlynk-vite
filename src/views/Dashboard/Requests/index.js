import { useState } from 'react'

import Card from 'components/Card/Card'

import { GetRequests } from '../../../graphQL/Queries'
import { usePaginatatedQuery } from '../../../hooks/usePaginatatedQuery'
import RequestTable from './RequestTable'

const Requests = () => {
  const [filters, setFilters] = useState({
    field: 'REQUESTS_REQUESTED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, reset } = usePaginatatedQuery(GetRequests, {
    selector: 'requests',
    variables: {
      ...filters
    }
  })

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
      />
    </Card>
  )
}

export default Requests
