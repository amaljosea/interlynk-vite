import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const { nodes, paginationProps, loading } = usePaginatedQuery(GetPolicies, {
    selector: 'policies'
  })

  return (
    <Card>
      <PolicyTable
        loading={loading}
        data={nodes || []}
        paginationProps={paginationProps}
      />
    </Card>
  )
}

export default Policies
