import { SimpleGrid } from '@chakra-ui/react'

import { DurationSelect } from './Selects/DurationSelect'
import { EnvironmentSelect } from './Selects/EnvironmentSelect'
import LabelSelect from './Selects/LabelSelect'
import { ProductSelect } from './Selects/ProductSelect'
import { VersionSelect } from './Selects/VersionSelect'

export const Filters = ({ filters, setFilters }) => {
  const changeFilter = (key, value) => {
    setFilters((filtersOld) => ({
      ...filtersOld,
      product: key === 'label' || key === 'env' ? [] : filtersOld.product,
      version: key === 'product' || key === 'env' ? [] : filtersOld.version,
      [key]: value
    }))
  }

  return (
    <SimpleGrid width='100%' columns={5} gap={5} alignItems='center'>
      <EnvironmentSelect
        value={filters.env}
        onChange={(value) => {
          changeFilter('env', value)
        }}
      />
      <LabelSelect
        filters={filters}
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
