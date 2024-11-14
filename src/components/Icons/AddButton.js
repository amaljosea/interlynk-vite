import { IconButton, Tooltip } from '@chakra-ui/react'

import { FaPlus } from 'react-icons/fa6'

const AddButton = ({
  label,
  colorScheme = 'blue', // default color scheme
  icon = <FaPlus />, // default icon
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
