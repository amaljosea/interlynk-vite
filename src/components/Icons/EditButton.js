import React from 'react'

import { EditIcon } from '@chakra-ui/icons'
import { Icon, IconButton, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const EditButton = ({
  onClick,
  size = 'sm',
  tooltip,
  hidden,
  tooltipPlacement,
  type,
  ...props
}) => {
  const { primaryTextColor, mainContrastBgColor } = useThemeColor([
    'primaryTextColor',
    'mainContrastBgColor'
  ])

  const iconColor = type === 'primary' ? mainContrastBgColor : primaryTextColor
  const buttonColor = type === 'primary' ? 'blue' : undefined

  const iconSize = size === 'sm' ? 3.5 : 4

  return (
    <Tooltip placement={tooltipPlacement} label={tooltip}>
      <IconButton
        size={size}
        cursor='pointer'
        hidden={hidden}
        onClick={onClick}
        colorScheme={buttonColor}
        icon={
          <Icon as={EditIcon} w={iconSize} h={iconSize} color={iconColor} />
        }
        {...props}
      />
    </Tooltip>
  )
}

export default EditButton
