import { CustomSelect } from './Select'

export const LifecycleSelect = ({ value, onChange }) => {
  const options = [
    { label: 'None', value: 'none' },
    { label: 'Design', value: 'design' },
    { label: 'Development', value: 'development' },
    { label: 'Released', value: 'released' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'End of Support', value: 'end_of_support' },
    { label: 'End of Life', value: 'end_of_life' }
  ]

  return (
    <CustomSelect
      isMulti
      value={value}
      label='Lifecycle'
      options={options}
      onChange={(newValue) => onChange(newValue)}
    />
  )
}
