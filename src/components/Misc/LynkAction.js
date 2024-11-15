import { IconButton, MenuButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

const LynkAction = ({ ...props }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  return (
    <MenuButton
      {...props}
      variant='none'
      as={IconButton}
      icon={<FaEllipsisV />}
      color={secondaryTextColor}
    />
  )
}

export default LynkAction
