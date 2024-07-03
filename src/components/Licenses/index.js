import { useState } from 'react'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import Card from 'components/Card/Card'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetLicensesTable } from 'graphQL/Queries'

import LicenseTable from './LicenseTable'

const Licenses = () => {
  const { userPermissions } = useGlobalState()
  const { orgView, orgLoading } = useGlobalQueryContext()
  const org = localStorage.getItem('organization')
  const viewLic = userPermissions?.find((item) => item?.key === 'view_license')

  const [filters, setFilters] = useState({})
  const { nodes, paginationProps, reset, loading } = usePaginatatedQuery(
    GetLicensesTable,
    {
      skip: !orgView,
      selector: 'organization.licenses',
      variables: {
        direction: 'ASC',
        ...filters
      }
    }
  )

  if (!orgView || viewLic?.value === false) {
    return <ViewAlert loading={orgLoading} category='license page' />
  }

  if (!org || org === 'undefined') return <OrgRegister />

  return (
    <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <LicenseTable
        loading={loading}
        licenses={nodes}
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

export default Licenses
