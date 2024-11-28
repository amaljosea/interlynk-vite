import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const Language = ({ disabled, language, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'language' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Language</FormLabel>
      <Input
        {...inputProps}
        value={language}
        autoComplete={'off'}
        onBlur={(e) => onBlur(8, e.target.value)}
        onChange={(e) => onChange('language', e.target.value)}
      />
    </FormControl>
  )
}

export default Language
