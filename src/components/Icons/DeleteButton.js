import React from 'react'

import { Icon, IconButton, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'

const DeleteButton = ({
  variant = 'ghost',
  onClick,
  isLoading = false,
  size = 'md',
  iconSize = 5,
  hidden,
  tooltip,
  ...props
}) => {
  const { grayBorderColor, primaryErrorColor, neutralBorder } = useThemeColor([
    'grayBorderColor',
    'primaryErrorColor',
    'neutralBorder'
  ])

  return (
    <Tooltip label={tooltip}>
      <IconButton
        size={size}
        border='1px solid'
        borderColor={grayBorderColor}
        colorScheme={variant === 'solid' && 'red'}
        variant={variant}
        isLoading={isLoading}
        onClick={onClick}
        hidden={hidden}
        {...props}
        icon={
          <Icon
            as={MdDeleteOutline}
            w={iconSize}
            h={iconSize}
            color={variant === 'ghost' ? primaryErrorColor : neutralBorder}
          />
        }
      />
    </Tooltip>
  )
}

export default DeleteButton
