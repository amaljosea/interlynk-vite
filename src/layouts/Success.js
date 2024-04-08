import DashboardBg from 'assets/img/dashboard.png'
import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Confirmation from 'views/Auth/Confirmation'
import Invitation from 'views/Auth/Invitation'

import { Box, Image } from '@chakra-ui/react'

const Success = () => {
  const navRef = useRef()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const confirmation = queryParams.get('confirmation_token')

  return (
    <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
      <Image
        src={DashboardBg}
        width={'100%'}
        height={'100%'}
        pos={'absolute'}
      />
      {confirmation ? <Confirmation /> : <Invitation />}
    </Box>
  )
}

export default Success
