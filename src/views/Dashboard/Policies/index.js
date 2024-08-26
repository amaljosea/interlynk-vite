import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const { nodes, paginationProps, loading } = usePaginatatedQuery(GetPolicies, {
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
