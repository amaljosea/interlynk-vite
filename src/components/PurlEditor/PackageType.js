import { packageTypes } from 'variables/general'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

const PackageType = ({ disabled, type, onChange }) => {
  return (
    <FormControl isDisabled={disabled} isRequired>
      <FormLabel htmlFor='type'>Package Type</FormLabel>
      <LynkSelect
        name='type'
        value={packageTypes?.find((opt) => opt.value === type) || null}
        onChange={(selected) => onChange('type', selected.value)}
        options={packageTypes}
        data-testid='purl_type'
        dropDown
      />
    </FormControl>
  )
}

export default PackageType
