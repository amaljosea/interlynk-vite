import { SimpleGrid } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { DurationSelect } from './Selects/DurationSelect'
import LabelSelect from './Selects/LabelSelect'
import { ProductSelect } from './Selects/ProductSelect'
import { VersionSelect } from './Selects/VersionSelect'

export const Filters = ({ filters, setFilters }) => {
  const { envName } = useGlobalState()

  const changeFilter = (key, value) => {
    setFilters((filtersOld) => ({
      ...filtersOld,
      product: key === 'label' ? [] : filtersOld.product,
      version: key === 'product' || key === 'label' ? [] : filtersOld.version,
      [key]: value
    }))
  }

  return (
    <SimpleGrid width='100%' columns={4} gap={5} alignItems='center'>
      <LabelSelect
        value={filters.labels}
        onChange={(value) => {
          changeFilter('label', value)
        }}
      />
      <ProductSelect
        filters={filters}
        value={filters.product}
        onChange={(value) => {
          changeFilter('product', value)
        }}
      />
      <VersionSelect
        env={envName}
        filters={filters}
        value={filters.version}
        onChange={(value) => {
          changeFilter('version', value)
        }}
      />
      <DurationSelect
        value={filters.duration}
        onChange={(value) => {
          changeFilter('duration', value)
        }}
      />
    </SimpleGrid>
  )
}
