import { refetchActiveQueries } from 'context/ApolloWrapper'
import React from 'react'

import { RepeatIcon } from '@chakra-ui/icons'
import { IconButton, Tooltip } from '@chakra-ui/react'

const RefreshBtn = ({ onClick }) => {
  return (
    <Tooltip label='Refresh'>
      <IconButton
        onClick={() => {
          refetchActiveQueries()
          if (onClick) {
            onClick()
          }
        }}
        colorScheme='blue'
        icon={<RepeatIcon />}
      ></IconButton>
    </Tooltip>
  )
}

export default RefreshBtn
