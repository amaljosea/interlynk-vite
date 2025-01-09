import { useState } from 'react'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const [filters, setFilters] = useState({
    search: ''
  })

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetPolicies,
    {
      selector: 'policies',
      variables: { ...filters }
    }
  )

  const onFilter = (data) => {
    setFilters(data)
    reset()
  }

  return (
    <Card>
      <PolicyTable
        data={nodes}
        filters={filters}
        loading={loading}
        paginationProps={paginationProps}
        setFilters={(newFilters) => onFilter(newFilters)}
      />
    </Card>
  )
}

export default Policies
