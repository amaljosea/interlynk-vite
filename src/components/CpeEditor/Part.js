import { FormControl, FormLabel, Select } from '@chakra-ui/react'

const Part = ({ disabled, part, onChange }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'part' }

  return (
    <FormControl isRequired isDisabled={disabled}>
      <FormLabel htmlFor='parts'>Part</FormLabel>
      <Select
        {...inputProps}
        value={part}
        data-testid='cpe_part'
        onChange={(e) => onChange('part', e.target.value, 2)}
      >
        <option value=''>-- Select --</option>
        <option value='a'>Application</option>
        <option value='o'>Operating System</option>
        <option value='h'>Hardware</option>
      </Select>
    </FormControl>
  )
}

export default Part
