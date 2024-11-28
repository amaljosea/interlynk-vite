import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const Edition = ({ disabled, edition, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'edition' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Edition</FormLabel>
      <Input
        {...inputProps}
        value={edition}
        autoComplete={'off'}
        onBlur={(e) => onBlur(7, e.target.value)}
        onChange={(e) => onChange('edition', e.target.value)}
      />
    </FormControl>
  )
}

export default Edition
