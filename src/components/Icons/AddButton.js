import { IconButton, Tooltip } from '@chakra-ui/react'

import { LuCirclePlus } from 'react-icons/lu'

const AddButton = ({
  label,
  colorScheme = 'blue', // default color scheme
  icon = <LuCirclePlus size={18} />, // default icon
  tooltipPlacement = 'bottom', //default tooltip placement
  variant = 'solid', //default variant
  ...props
}) => {
  // console.log('props', props)
  return (
    <Tooltip label={label} placement={tooltipPlacement}>
      <IconButton
        variant={variant}
        colorScheme={colorScheme}
        icon={icon}
        {...props}
      />
    </Tooltip>
  )
}

export default AddButton
