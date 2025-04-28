import React from 'react'

import { Badge } from '@chakra-ui/react'

const LynkBadge = ({ color, title }) => {
  return (
    <Badge
      fontSize={14}
      w={'fit-content'}
      colorScheme={color}
      fontWeight={'normal'}
    >
      {title}
    </Badge>
  )
}

export default LynkBadge
