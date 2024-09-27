import { InfoIcon } from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const Info = (props) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  return (
    <Icon as={InfoIcon} color={primaryBlueText} cursor={'pointer'} {...props} />
  )
}

export default Info
