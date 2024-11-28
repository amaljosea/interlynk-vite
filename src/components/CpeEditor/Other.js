import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const Other = ({ disabled, other, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'other' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Other</FormLabel>
      <Input
        {...inputProps}
        value={other}
        autoComplete={'off'}
        onBlur={(e) => onBlur(12, e.target.value)}
        onChange={(e) => onChange('other', e.target.value)}
      />
    </FormControl>
  )
}

export default Other
