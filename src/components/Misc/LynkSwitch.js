import { Switch } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkSwitch = (props) => {
  const { primaryBgColor } = useThemeColor(['primaryBgColor'])
  return (
    <Switch
      {...props}
      sx={{
        '.chakra-switch__thumb[data-checked]': {
          backgroundColor: primaryBgColor
        }
      }}
    />
  )
}

export default LynkSwitch
