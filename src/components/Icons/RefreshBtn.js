import { refetchActiveQueries } from 'context/ApolloWrapper'

import { IconButton, Tooltip } from '@chakra-ui/react'

import { TbRefresh } from 'react-icons/tb'

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
        aria-label='refresh'
        colorScheme='blue'
        icon={<TbRefresh fontSize={20} />}
      ></IconButton>
    </Tooltip>
  )
}

export default RefreshBtn
