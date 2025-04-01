import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

const Part = ({ disabled, part, onChange }) => {
  const inputProps = { size: 'md', name: 'part' }

  const options = [
    { value: '', label: '-- Select --' },
    { value: 'a', label: 'Application' },
    { value: 'o', label: 'Operating System' },
    { value: 'h', label: 'Hardware' }
  ]

  return (
    <FormControl isRequired isDisabled={disabled}>
      <FormLabel htmlFor='parts'>Part</FormLabel>
      <LynkSelect
        {...inputProps}
        data-testid='cpe_part'
        onChange={(selectedOption) =>
          onChange('part', selectedOption?.value, 2)
        }
        options={options}
        value={options.find((option) => option.value === part)}
        placeholder='-- Select --'
        dropDown
      />
    </FormControl>
  )
}

export default Part
