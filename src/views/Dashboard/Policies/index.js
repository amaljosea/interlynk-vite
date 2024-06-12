import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import Card from 'components/Card/Card'
import PolicyTable from 'components/Tables/PolicyTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const org = localStorage.getItem('organization')

  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    GetPolicies,
    {
      skip: org !== 'undefined' ? false : true,
      selector: 'policies'
    }
  )

  if (!org || org === 'undefined') return <OrgRegister />

  return (
    <Card>
      <PolicyTable
        loading={loading}
        data={nodes}
        refetch={refetch}
        paginationProps={paginationProps}
      />
    </Card>
  )
}

export default Policies
