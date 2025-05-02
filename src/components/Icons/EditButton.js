import React from 'react'

import { Icon, IconButton, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuSquarePen } from 'react-icons/lu'

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

  return (
    <Tooltip placement={tooltipPlacement} label={tooltip}>
      <IconButton
        size={size}
        cursor='pointer'
        hidden={hidden}
        onClick={onClick}
        colorScheme={buttonColor}
        icon={<Icon as={LuSquarePen} fontSize={18} color={iconColor} />}
        {...props}
      />
    </Tooltip>
  )
}

export default EditButton
