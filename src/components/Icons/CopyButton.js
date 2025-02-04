import React from 'react'

import { IconButton } from '@chakra-ui/react'

import { FaCheck, FaRegCopy } from 'react-icons/fa6'

const CopyButton = ({
  isDisabled,
  onCopy,
  hasCopied = false,
  size = 'sm',
  colorScheme = { copied: 'green', default: 'gray' },
  icon = <FaRegCopy />,
  ...props
}) => {
  return (
    <IconButton
      size={size}
      isDisabled={isDisabled}
      onClick={onCopy}
      colorScheme={hasCopied ? colorScheme.copied : colorScheme.default}
      icon={hasCopied ? <FaCheck /> : icon}
      {...props}
    />
  )
}

export default CopyButton
