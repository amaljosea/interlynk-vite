import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

const TargetHardware = ({ disabled, targetHardware, onChange }) => {
  const inputProps = { size: 'md', name: 'targetHardware' }

  return (
    <FormControl isDisabled={disabled}>
      <FormLabel>Target Hardware</FormLabel>
      <LynkSelect
        {...inputProps}
        value={
          targetHardware
            ? { value: targetHardware, label: targetHardware }
            : null
        }
        onChange={(selectedOption) =>
          onChange('targetHardware', selectedOption?.value, 11)
        }
        options={[
          { value: '', label: '-- Select --' },
          { value: 'x64', label: 'x64' },
          { value: 'x86', label: 'x86' },
          { value: 'x32', label: 'x32' },
          { value: 'arm64', label: 'arm64' },
          { value: 'amd64', label: 'amd64' },
          { value: 'itanium', label: 'itanium' },
          { value: 'arm', label: 'arm' },
          { value: 'rj45', label: 'rj45' },
          { value: 'iphone', label: 'iphone' },
          { value: 'android', label: 'android' },
          { value: '*', label: '*' }
        ]}
        placeholder='-- Select --'
        dropDown
        menuPlacement='top'
      />
    </FormControl>
  )
}

export default TargetHardware
