import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useState } from 'react'

import { IconButton, Spinner, Tooltip } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { TbRefresh } from 'react-icons/tb'

const RefreshBtn = ({ onClick }) => {
  const [loading, setLoading] = useState(false)
  const { showToast } = useCustomToast()
  const refetch = async () => {
    try {
      setLoading(true)
      await refetchActiveQueries()
    } catch (err) {
      showToast({
        description: 'Refetch failed. Please try again',
        status: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <Tooltip label='Refresh'>
      <IconButton
        onClick={() => {
          refetch()
          if (onClick) {
            onClick()
          }
        }}
        aria-label='refresh'
        colorScheme='blue'
        icon={loading ? <Spinner size='sm' /> : <TbRefresh fontSize={20} />}
      ></IconButton>
    </Tooltip>
  )
}

export default RefreshBtn
