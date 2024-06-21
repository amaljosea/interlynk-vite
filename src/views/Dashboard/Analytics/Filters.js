import React from 'react'

import { Flex } from '@chakra-ui/react'

import { DurationSelect } from './Selects/DurationSelect'
import { EnvironmentSelect } from './Selects/EnvironmentSelect'
import { ProductSelect } from './Selects/ProductSelect'
import { VersionSelect } from './Selects/VersionSelect'

const getProjectId = (filters) => {
  const selectedEnv = filters.env?.value
  const selectedProject = filters.product?.projects?.find(
    (project) => project.name == selectedEnv
  )
  return selectedProject?.id || null
}

export const Filters = ({ filters, setFilters }) => {
  const changeFilter = (key, value) => {
    setFilters((filtersOld) => ({
      ...filtersOld,
      version: key === 'product' || key === 'env' ? null : filtersOld.version,
      [key]: value
    }))
  }

  const projectId = getProjectId(filters)

  return (
    <Flex alignItems={'center'} gap={4}>
      <EnvironmentSelect
        value={filters.env}
        onChange={(value) => {
          changeFilter('env', value)
        }}
      />

      <ProductSelect
        value={filters.product}
        onChange={(value) => {
          changeFilter('product', value)
        }}
      />
      <VersionSelect
        projectId={projectId}
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
    </Flex>
  )
}
