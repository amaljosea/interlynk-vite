
import { FormControl, FormLabel, Select } from '@chakra-ui/react'
import { packageTypes } from 'variables/general'

const PackageType = ({ disabled, type, onChange, onBlur }) => {
  return (
    <FormControl isDisabled={disabled}>
      <FormLabel htmlFor='type'>Package Type</FormLabel>
      <Select
        size='md'
        name='type'
        value={type}
        fontSize={'sm'}
        data-testid='purl_type'
        onBlur={(e) => onBlur('type', e.target)}
        onChange={(e) => onChange('type', e.target.value)}
      >
        {packageTypes?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  )
}

export default PackageType
