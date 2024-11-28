import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const SwEdition = ({ disabled, swEdition, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'swEdition' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>SW Edition</FormLabel>
      <Input
        {...inputProps}
        value={swEdition}
        autoComplete={'off'}
        onBlur={(e) => onBlur(9, e.target.value)}
        onChange={(e) => onChange('swEdition', e.target.value)}
      />
    </FormControl>
  )
}

export default SwEdition
