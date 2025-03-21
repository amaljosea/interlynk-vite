import { updatedValue } from 'utils'

import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

const Operator = ({ index, data, onChange }) => {
  const { id, list, operator, opError } = data || {}

  const operatorOptions = [
    { value: '', label: '-- operator --' },
    ...list.map((option) => ({
      value: option,
      label: updatedValue(option).toLowerCase()
    }))
  ]

  const selectStyles = {
    container: (baseStyles) => ({
      ...baseStyles,
      minWidth: '100px'
    })
  }

  const selectedOption =
    operatorOptions.find((opt) => opt.value === operator) || operatorOptions[0]

  return (
    <FormControl isInvalid={opError}>
      <LynkSelect
        name='operator'
        value={selectedOption}
        placeholder='-- operator --'
        options={operatorOptions}
        onChange={(option) => onChange(option?.value || '', id, 'operator')}
        id={`condition_operator_${index}`}
        dropDown
        styles={selectStyles}
      />
      <FormErrorMessage>{opError}</FormErrorMessage>
    </FormControl>
  )
}

export default Operator
