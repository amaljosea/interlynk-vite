import React from 'react'

import { Flex } from '@chakra-ui/react'

export default function IconBox(props) {
  const { children, ...rest } = props

  return (
    <Flex
      {...rest}
      alignItems={'center'}
      justifyContent={'center'}
      borderRadius={'lg'}
    >
      {children}
    </Flex>
  )
}
