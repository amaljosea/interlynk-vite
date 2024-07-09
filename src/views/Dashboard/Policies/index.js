import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const org = localStorage.getItem('organization')
  const orgNotFound = !org || org === 'undefined'

  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    GetPolicies,
    {
      skip: orgNotFound,
      selector: 'policies'
    }
  )

  if (orgNotFound) return <OrgRegister />

  return (
    <Card>
      <PolicyTable
        loading={loading}
        data={nodes || []}
        refetch={refetch}
        paginationProps={paginationProps}
      />
    </Card>
  )
}

export default Policies
