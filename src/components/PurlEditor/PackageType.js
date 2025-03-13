import { packageTypes } from 'variables/general'

import { FormControl, FormLabel, Select } from '@chakra-ui/react'

const PackageType = ({ disabled, type, onChange }) => {
  return (
    <FormControl isDisabled={disabled} isRequired>
      <FormLabel htmlFor='type'>Package Type</FormLabel>
      <Select
        size='md'
        name='type'
        value={type}
        data-testid='purl_type'
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
