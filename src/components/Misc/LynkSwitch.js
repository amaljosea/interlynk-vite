import { Switch } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'

const LynkSwitch = (props) => {
  const switchColor = useColorModeValue('#ffffff', '#1f2733')

  return (
    <Switch
      {...props}
      sx={{
        '.chakra-switch__thumb[data-checked]': {
          backgroundColor: switchColor
        }
      }}
    />
  )
}

export default LynkSwitch
