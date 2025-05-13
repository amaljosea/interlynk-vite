import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/react'

const ToggleVisibilityButton = ({ onClick, showPassword, ...props }) => {
  return (
    <IconButton
      size='sm'
      right='2'
      h='1.75rem'
      variant='unstyled'
      position='absolute'
      onClick={onClick}
      icon={!showPassword ? <ViewIcon /> : <ViewOffIcon />}
      {...props}
    />
  )
}

export default ToggleVisibilityButton
