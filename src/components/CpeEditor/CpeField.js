import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'

const CpeField = ({
  label,
  name,
  value,
  onChange,
  isValid,
  disabled,
  index
}) => {
  const inputProps = { size: 'md', fontSize: 'sm', name }

  return (
    <FormControl isDisabled={disabled} isInvalid={!isValid}>
      <FormLabel>{label}</FormLabel>
      <Input
        {...inputProps}
        value={value}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(e) => onChange(name, e.target.value, index)}
      />
      {!isValid && (
        <FormErrorMessage>
          Invalid {label.toLowerCase()} format
        </FormErrorMessage>
      )}
    </FormControl>
  )
}

export default CpeField
