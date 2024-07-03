import { useQuery } from '@apollo/client'
import { useState } from 'react'

import Card from 'components/Card/Card'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

import { GetRequests } from '../../../graphQL/Queries'
import { usePaginatatedQuery } from '../../../hooks/usePaginatatedQuery'
import OrgRegister from '../Profile/components/OrgRegister'
import RequestTable from './RequestTable'

const Requests = () => {
  const { orgView, orgLoading } = useGlobalQueryContext()
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({
    field: 'REQUESTS_REQUESTED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, reset, refetch } = usePaginatatedQuery(
    GetRequests,
    {
      skip: !orgView,
      selector: 'requests',
      variables: {
        ...filters
      }
    }
  )

  if (!orgView)
    return <ViewAlert loading={orgLoading} category='request page' />

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

export default Requests
