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

  const selectedOption =
    operatorOptions.find((opt) => opt.value === operator) || operatorOptions[0]

  return (
    <FormControl isInvalid={opError}>
      <LynkSelect
        id='operator'
        name='operator'
        value={selectedOption}
        placeholder='-- operator --'
        options={operatorOptions}
        onChange={(option) => onChange(option?.value || '', id, 'operator')}
        data-testid={`condition_operator_${index}`}
        dropDown
      />
      <FormErrorMessage>{opError}</FormErrorMessage>
    </FormControl>
  )
}

export default Operator
