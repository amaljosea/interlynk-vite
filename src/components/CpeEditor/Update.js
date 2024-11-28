import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const Update = ({ disabled, update, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'update' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Update</FormLabel>
      <Input
        {...inputProps}
        value={update}
        autoComplete={'off'}
        data-testid='cpe_update'
        onBlur={(e) => onBlur(6, e.target.value)}
        onChange={(e) => onChange('update', e.target.value)}
      />
    </FormControl>
  )
}

export default Update
