import { updatedValue } from 'utils'

import { FormControl, FormErrorMessage, Select } from '@chakra-ui/react'

const Operator = ({ index, data, onChange }) => {
  const { id, list, operator, opError } = data || {}
  return (
    <FormControl isInvalid={opError}>
      <Select
        id='operator'
        name='operator'
        value={operator}
        textTransform={'lowercase'}
        placeholder='-- operator -- '
        data-testid={`condition_operator_${index}`}
        onChange={(e) => onChange(e.target.value, id, 'operator')}
      >
        {list?.map((option, idx) => (
          <option
            key={idx}
            value={option}
            style={{ textTransform: 'lowercase' }}
          >
            {updatedValue(option)}
          </option>
        ))}
      </Select>
      <FormErrorMessage>{opError}</FormErrorMessage>
    </FormControl>
  )
}

export default Operator
