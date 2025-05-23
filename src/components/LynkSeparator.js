import { Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const LynkSeparator = ({ hidden }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])
  return (
    <Text color={secondaryTextColor} hidden={hidden}>
      •
    </Text>
  )
}

export default LynkSeparator
