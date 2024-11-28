import { FormControl, FormLabel, Input } from '@chakra-ui/react'

const TargetSoftware = ({ disabled, targetSoftware, onChange, onBlur }) => {
  const inputProps = { size: 'md', fontSize: 'sm', name: 'targetSoftware' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Target Software</FormLabel>
      <Input
        {...inputProps}
        autoComplete={'off'}
        value={targetSoftware}
        onBlur={(e) => onBlur(10, e.target.value)}
        onChange={(e) => onChange('targetSoftware', e.target.value)}
      />
    </FormControl>
  )
}

export default TargetSoftware
