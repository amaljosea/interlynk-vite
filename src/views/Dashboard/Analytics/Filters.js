import { SimpleGrid } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { DurationSelect } from './Selects/DurationSelect'
import LabelSelect from './Selects/LabelSelect'
import { LifecycleSelect } from './Selects/LifecycleSelect'
import { ProductSelect } from './Selects/ProductSelect'
import { VersionSelect } from './Selects/VersionSelect'

export const Filters = () => {
  const { analyticsState, dispatch } = useGlobalState()
  const { analyticsDispatch } = dispatch

  const { product, label, lifecycle, version, duration } = analyticsState || {}

  const changeFilter = (key, value) => {
    switch (key) {
      case 'label':
        return analyticsDispatch({ type: 'FILTER_LABEL', payload: value })
      case 'product':
        return analyticsDispatch({ type: 'FILTER_PRODUCT', payload: value })
      case 'lifecycle':
        return analyticsDispatch({ type: 'FILTER_LIFECYCLE', payload: value })
      case 'version':
        return analyticsDispatch({ type: 'FILTER_VERSION', payload: value })
      case 'duration':
        return analyticsDispatch({ type: 'FILTER_DURATION', payload: value })
      default:
        return null
    }
  }

  return (
    <SimpleGrid width='100%' columns={5} gap={5} alignItems='center'>
      <LabelSelect
        value={label}
        onChange={(value) => changeFilter('label', value)}
      />
      <ProductSelect
        value={product}
        onChange={(value) => changeFilter('product', value)}
      />
      <LifecycleSelect
        value={lifecycle}
        onChange={(value) => changeFilter('lifecycle', value)}
      />
      <VersionSelect
        value={version}
        onChange={(value) => changeFilter('version', value)}
      />
      <DurationSelect
        value={duration}
        onChange={(value) => changeFilter('duration', value)}
      />
    </SimpleGrid>
  )
}
