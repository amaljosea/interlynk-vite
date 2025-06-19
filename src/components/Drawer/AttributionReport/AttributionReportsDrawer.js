import { useCallback, useState } from 'react'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetAttributionsData } from 'graphQL/Queries'

import AttributionTable from './AttributionTable'

const AttributionReportsDrawer = ({ isOpen, onClose, sbomData }) => {
  const [filters, setFilters] = useState({
    orderBy: { field: 'COMPONENTS_UPDATED_AT', direction: 'DESC' }
  })

  const sbomId = sbomData?.id
  const variables = { sbomId, ...filters }

  const { nodes, paginationProps, reset, loading, error } = usePaginatedQuery(
    GetAttributionsData,
    {
      skip: !sbomId,
      selector: 'attributions',
      variables
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
    <AttributionTable
      isOpen={isOpen}
      onClose={onClose}
      data={nodes}
      loading={loading}
      paginationProps={paginationProps}
      filters={variables}
      setFilters={updateFilters}
      error={error}
      sbomData={sbomData}
    />
  )
}

export default AttributionReportsDrawer
