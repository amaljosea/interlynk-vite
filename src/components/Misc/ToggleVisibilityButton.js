import { IconButton } from '@chakra-ui/react'

import { LuEye, LuEyeOff } from 'react-icons/lu'

const ToggleVisibilityButton = ({ onClick, showPassword, ...props }) => {
  return (
    <IconButton
      size='sm'
      right='2'
      h='1.75rem'
      variant='unstyled'
      position='absolute'
      onClick={onClick}
      icon={!showPassword ? <LuEye /> : <LuEyeOff />}
      {...props}
    />
  )
}

export default ToggleVisibilityButton
