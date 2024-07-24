import { useState } from 'react'

import Card from 'components/Card/Card'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetLicensesTable } from 'graphQL/Queries'

import LicenseTable from './LicenseTable'

const Licenses = () => {
  const { orgView } = useGlobalQueryContext()

  const [filters, setFilters] = useState({
    search: '',
    orderBy: { field: 'ORGANIZATION_LICENSES_STATE', direction: 'ASC' }
  })

  const { nodes, paginationProps, reset, loading } = usePaginatatedQuery(
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
