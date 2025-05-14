import React from 'react'

import { IconButton } from '@chakra-ui/react'

import { LuCheck, LuCopy } from 'react-icons/lu'

const CopyButton = ({
  isDisabled,
  onCopy,
  hasCopied = false,
  size = 'sm',
  colorScheme = { copied: 'green', default: 'gray' },
  icon = <LuCopy size={18} />,
  ...props
}) => {
  return (
    <IconButton
      size={size}
      isDisabled={isDisabled}
      onClick={onCopy}
      colorScheme={hasCopied ? colorScheme.copied : colorScheme.default}
      icon={hasCopied ? <LuCheck size={18} /> : icon}
      {...props}
    />
  )
}

export default CopyButton
