import { refetchActiveQueries } from 'context/ApolloWrapper'
import { useState } from 'react'

import { IconButton, Spinner, Tooltip } from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { LuRefreshCw } from 'react-icons/lu'

const RefreshBtn = ({ queries }) => {
  const { showToast } = useCustomToast()
  const [loading, setLoading] = useState(false)

  const icon = loading ? <Spinner size={'sm'} /> : <LuRefreshCw size={18} />

  const refetch = async () => {
    try {
      setLoading(true)
      await refetchActiveQueries(queries)
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
        icon={icon}
        onClick={refetch}
        colorScheme='blue'
        aria-label='refresh'
      />
    </Tooltip>
  )
}

export default RefreshBtn
