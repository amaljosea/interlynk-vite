import React from 'react'

import { Badge } from '@chakra-ui/react'

const LynkBadge = ({ color, title, action }) => {
  return (
    <Badge
      fontSize={14}
      onClick={action}
      w={'fit-content'}
      colorScheme={color}
      fontWeight={'normal'}
    >
      {title}
    </Badge>
  )
}

export default LynkBadge
