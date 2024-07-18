import { useState } from 'react'

import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetSupportTab } from 'graphQL/Queries'

const Support = () => {
  const [filters, setFilters] = useState({
    field: 'COMPONENT_SUPPORT_OVERRIDES_UPDATED_AT',
    direction: 'DESC'
  })

  const { nodes, paginationProps, reset, loading, refetch } =
    usePaginatatedQuery(GetSupportTab, {
      selector: 'supports',
      variables: {
        ...filters
      }
    })

  return (
    <Card>
      <SupportTable
        loading={loading}
        data={nodes}
        refetch={refetch}
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

export default Support
