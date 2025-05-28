import { TabProvider } from 'context/TabContext'
import { useCallback, useState } from 'react'

import Card from 'components/Card/Card'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { PackageVersionsTable } from 'graphQL/Queries'

import PackageTable from './PackageTable'

const Package = () => {
  const [filters, setFilters] = useState({
    orderBy: { field: 'PACKAGE_VERSIONS_UPDATED_AT', direction: 'ASC' }
  })

  const { nodes, paginationProps, reset, loading } = usePaginatedQuery(
    PackageVersionsTable,
    {
      skip: false,
      selector: 'packageVersions',
      variables: filters
    }
  )

  const updateFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters)
      reset()
    },
    [reset]
  )

  return (
    <TabProvider>
      <Card>
        <PackageTable
          data={nodes}
          loading={loading}
          paginationProps={paginationProps}
          filters={filters}
          setFilters={updateFilters}
        />
      </Card>
    </TabProvider>
  )
}

export default Package
