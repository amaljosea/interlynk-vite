import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

export const CustomSelect = ({ label, ...props }) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <LynkSelect
        {...props}
        placeholder='Select'
        isClearable={true}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null
        }}
      />
    </FormControl>
  )
}
