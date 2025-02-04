import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const Qualifiers = ({ disabled, qualifiers, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'qualifiers' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Qualifiers</FormLabel>
      <Input
        {...inputProps}
        value={qualifiers}
        data-testid={`purl_qualifiers`}
        onBlur={(e) => onBlur('qualifiers', e.target)}
        onChange={(e) => onChange('qualifiers', e.target.value)}
      />
    </FormControl>
  )
}

export default Qualifiers
