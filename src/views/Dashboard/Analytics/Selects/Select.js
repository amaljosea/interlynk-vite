import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

export const CustomSelect = ({ label, ...props }) => {
  return (
    <FormControl marginRight={5}>
      <FormLabel>{label}</FormLabel>
      <LynkSelect
        {...props}
        placeholder='Select'
        isClearable={true}
        components={{
          DropdownIndicator: () => null
        }}
      />
    </FormControl>
  )
}
