import React, { useEffect } from 'react'

import { useGlobalState } from 'hooks/useGlobalState'

import { CustomSelect } from './Select'

const options = [
  { value: 'default', label: 'Default' },
  { value: 'production', label: 'Production' },
  { value: 'development', label: 'Development' }
]

export const EnvironmentSelect = ({ value, onChange }) => {
  const { envName } = useGlobalState()

  useEffect(() => {
    const defaultValue = envName || 'default'
    const defaultOption = options.find((i) => i.value === defaultValue)
    onChange(defaultOption)
  }, [])

  return (
    <CustomSelect
      label='Environment'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
