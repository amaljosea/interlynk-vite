import { useState } from 'react'

import Card from 'components/Card/Card'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetLicensesTable } from 'graphQL/Queries'

import LicenseTable from './LicenseTable'

const Licenses = () => {
  const { orgView } = useGlobalQueryContext()

  const [filters, setFilters] = useState({
    search: '',
    orderBy: { field: 'ORGANIZATION_LICENSES_UPDATED_AT', direction: 'DESC' }
  })

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    GetLicensesTable,
    {
      skip: !orgView,
      selector: 'organization.licenses',
      variables: {
        ...filters
      }
    }
  )

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
