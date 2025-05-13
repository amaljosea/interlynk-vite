import { IconButton, MenuButton } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuEllipsisVertical } from 'react-icons/lu'

const LynkAction = ({ ...props }) => {
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  return (
    <MenuButton
      {...props}
      variant='none'
      as={IconButton}
      icon={<LuEllipsisVertical size={20} />}
      color={secondaryTextColor}
    />
  )
}

export default LynkAction
