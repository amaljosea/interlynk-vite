import React, { useEffect } from 'react'

import { CustomSelect } from './Select'

const options = [
  { value: 'default', label: 'Default' },
  { value: 'production', label: 'Production' },
  { value: 'development', label: 'Development' }
]

export const EnvironmentSelect = ({ value, onChange }) => {
  useEffect(() => {
    const defaultValue = localStorage.getItem('environment') || 'default'
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
