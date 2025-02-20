import { FormControl, FormLabel, Select } from '@chakra-ui/react'

const TargetHardware = ({ disabled, targetHardware, onChange }) => {
  const inputProps = { size: 'md', name: 'targetHardware' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Target Hardware</FormLabel>
      <Select
        {...inputProps}
        value={targetHardware}
        onChange={(e) => onChange('targetHardware', e.target.value, 11)}
      >
        <option value=''>-- Select --</option>
        <option value='x64'>x64</option>
        <option value='x86'>x86</option>
        <option value='x32'>x32</option>
        <option value='arm64'>arm64</option>
        <option value='amd64'>amd64</option>
        <option value='itanium'>itanium</option>
        <option value='arm'>arm</option>
        <option value='rj45'>rj45</option>
        <option value='iphone'>iphone</option>
        <option value='android'>android</option>
        <option value='*'>*</option>
      </Select>
    </FormControl>
  )
}

export default TargetHardware
