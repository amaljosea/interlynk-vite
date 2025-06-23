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
        placeholder={`e.g. arch=amd64&os=linux`}
        onBlur={(e) => onBlur('qualifiers', e.target.value)}
        onChange={(e) => onChange('qualifiers', e.target.value)}
      />
    </FormControl>
  )
}

export default Qualifiers
