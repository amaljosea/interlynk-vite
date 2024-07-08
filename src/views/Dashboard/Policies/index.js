import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import Card from 'components/Card/Card'
import ViewAlert from 'components/Misc/ViewAlert'
import PolicyTable from 'components/Tables/PolicyTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetPolicies } from 'graphQL/Queries'

const Policies = () => {
  const { userPermissions } = useGlobalState()
  const org = localStorage.getItem('organization')
  const { orgView, orgLoading } = useGlobalQueryContext()
  const policy = useHasPermission({
    parentKey: 'view_policy'
  })

  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    GetPolicies,
    {
      skip: !orgView || policy === false,
      selector: 'policies'
    }
  )

  if (!orgView) {
    return <ViewAlert loading={orgLoading} category='policy page' />
  }

  if (!org || org === 'undefined') return <OrgRegister />

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
